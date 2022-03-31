import json
import math
import numpy as np


def getTimeLineData(gameID='0021500003'):
    # 读取数据
    file1 = open(
        '/home/cbf/data/basketball/data collection/GameData/playerDataLinkDataTimeData/time_' + gameID + '.json')
    # 转化为json
    data = json.loads(file1.readline())
    timeList = data['timeList']
    # 计算数据
    timeListData = processTimeLineData(timeList)
    # 返回数据
    return timeListData


# 处理时间线数据
def processTimeLineData(data):
    timeList = []
    for timeData in data:
        nodeList = timeData[6]
        linkList = timeData[7]
        nodeSpeedList = []
        linkDisList = []
        nodeNum = 0
        linkNum = 0
        # 遍历节点
        for node in nodeList:
            if node[1] == -1:
                continue
            nodeNum += 1
            nodeSpeedList.append(node[5])
        # 遍历链接
        for link in linkList:
            if link[1] == -1:
                continue
            linkNum += 1
            linkDisList.append(link[3])
        nodeSpeedAve = np.mean(nodeSpeedList)
        nodeDegreeAve = linkNum * 2 / nodeNum
        linkDisAve = np.mean(linkDisList)

        # 保存时间数据
        timeObj = [
            timeData[0],  # unixtTime
            timeData[1],  # period
            timeData[2],  # periodTime
            nodeNum,  # nodeNum
            linkNum,  # linkNum
            nodeSpeedAve,  # ave speed
            nodeDegreeAve,  # degree ave
            linkDisAve  # link distance ave
        ]

        timeList.append(timeObj)


    return timeList


if __name__ == '__main__':
    getTimeLineData()

    print(1)
