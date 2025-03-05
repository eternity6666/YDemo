import requests
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import datetime
import json

load_dotenv()
API_KEY = os.getenv("DEEPSEEK_API_KEY")
API_URL = os.getenv("DEEPSEEK_API_ENDPOINT")
OUTPUT_DIR = os.getenv("OUTPUT_DIR")
date = datetime.datetime.now().strftime('%Y-%m-%d')
outputDir = f"{OUTPUT_DIR}/{date}"

def useDeepSeek(contentList):
    if len(contentList) == 0:
        return {}
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "deepseek-r1",  # 可选模型：deepseek-chat / deepseek-reasoner[4,6](@ref)
        "messages": [
            {
                "role": "user", "content": '''
请基于今日IT之家热榜Top 12内容（附后数据），撰写一篇符合科技新媒体传播规律能带来高阅读量高完读率的公众号推文，要求：
​选题策略
热度叠加：选取3个存在关联性的高互动话题（如「iOS18新功能」「华为纯血鸿蒙」「谷歌AI泄露」），形成话题矩阵
争议挖掘：在小米汽车降价、英伟达芯片禁令等话题中提取反常识观点（如「价格战伤害了谁？」）
情绪锚点：突出「AI手机淘汰论」「年轻人逃离微信」等焦虑型议题
​标题结构
采用「核心悬念+利益关联+符号强化」结构，例：
「苹果谷歌华为昨夜同时出手！这3个变化让你手机明年就报废？」
​内容架构
开头：用「24小时动态」建立时效性（例：汇总凌晨海外发布会要点）
中段：设置「行业地震→用户影响→生存指南」递进逻辑
结尾：埋设「投票+评论区话题」双互动钩子
​传播优化
信息密度：每300字插入「快讯速览」灰色框体调节阅读节奏
视觉思维：用「自研芯片对比表」「技术路线时间轴」等替代纯文字
平台适配：在「苹果用户吐槽」「安卓隐藏技巧」等段落插入微信表情包
'''.strip()
            },
            {
                "role": "user", "content": f"{contentList}"
            }
        ],
        "temperature": 0.7,  # 控制创造性（0-1）[2,4](@ref)
        "max_tokens": 51200    # 限制响应长度[2,3](@ref)
    }

    response = requests.post(API_URL, headers=headers, json=data)
    result = response.json()
    return result

def loadUrl(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "referer": "https://www.ithome.com/"
    }
    try:
        response = requests.get(url, headers=headers)
        response.encoding = 'utf-8'
        print('Load url:', url, ' success')
        return response
    except Exception as e:
        print('Load url:', url, ' failed:', e)
        return None

def collectOrderList():
    url = 'https://www.ithome.com/'
    response = loadUrl(url)
    if response is None:
        print('Load failed url:', url)
        return [] 
    soup = BeautifulSoup(response.text, 'html.parser')
    orderList = soup.find_all('ul', class_='order', id='d-1')
    if len(orderList) == 0:
        print('No order list found url:', url)
        return []
    result = []
    for item in orderList:
        aList = item.find_all('a')
        for a in aList:
            if a is None:
                continue
            result.append({
                'title': a.text,
                'url': a['href']
            })
    return result

def collectContentList(orderList):
    if len(orderList) == 0:
        return []
    contentList = []
    for order in orderList:
        url = order['url']
        title = order['title']
        print('Collecting url:', url)
        response = loadUrl(url)
        if response is None:
            print('Load failed url:`', url)
            continue
        soup = BeautifulSoup(response.text, 'html.parser')
        paragraph = soup.find_all('div', id='paragraph')
        if paragraph is None:
            print('No div found in url:', url)
            continue
        if len(paragraph) == 0:
            print('Div is empty url:', url)
            continue
        paragraph = paragraph[0]
        for p in paragraph.find_all('p', class_='ad-tips'):
            p.decompose()
        for div in paragraph.find_all('div', class_='tougao-user'):
            div.decompose()
        contentList.append({
            'title': title,
            'content': paragraph.text.strip()
        })
    return contentList

def tryWriteContent(jsonContent):
    if jsonContent is None:
        print('No content to output')
        return
    if 'choices' in jsonContent:
        if len(jsonContent['choices']) != 0:
            if 'message' in jsonContent['choices'][0]:
                if 'content' in jsonContent['choices'][0]['message']:
                    content = jsonContent['choices'][0]['message']['content']
                    with open(f'{outputDir}/content.md', 'w') as f:
                        f.write(content)
                    print('Write content.md success')

def collectContents():
    orderList = collectOrderList()
    if len(orderList) == 0:
        print('No order to collect')
        return
    contentList = collectContentList(orderList)
    if len(contentList) == 0:
        print('No content to collect')
        return
    if not os.path.exists(outputDir):
        os.makedirs(outputDir)
    with open(f'{outputDir}/files.txt', 'w') as f:
        f.write(json.dumps(contentList, ensure_ascii=False, indent=4))
    print('Write files.txt success')
    jsonContent = useDeepSeek(contentList)
    if len(jsonContent) == 0:
        print('No content to output')
        return
    with open(f'{outputDir}/result.json', 'w') as f:
        f.write(json.dumps(jsonContent, ensure_ascii=False, indent=4))
    print('Write result.json success')
    tryWriteContent(jsonContent)

if __name__ == "__main__":
    collectContents()