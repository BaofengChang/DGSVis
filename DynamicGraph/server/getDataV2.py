import json
import math
import datetime
import numpy as np


# 读取比赛文件
def readGameFile(gameID):
    file = open("/home/cbf/data/basketball/data collection/gamePositionDataWithSpeedAndGraphs/" + gameID + '.json')
    data = json.loads(file.readline())
    return data


def readTimeGameFile(gameID):
    file = open("/home/cbf/data/basketball/data collection/GameData/" + 'timeStamp_' + gameID + '.json')
    data = json.loads(file.readline())
    return data


# 暂时不用这个版本
def getRoundGraphListV1(data):
    # 比赛数据
    gameData = data['data']

    gameList = []
    for quarterIndex in range(len(gameData)):
        quarterData = gameData[quarterIndex]  # 得到 这个小节的 数据
        quarterList = []
        for roundIndex in range(len(quarterData)):
            roundData = quarterData[roundIndex]  # 得到 这个回合 的数据
            roundNodesMap = {}
            roundLinksMap = {}
            for timeIndex in range(len(roundData)):
                timeData = roundData[timeIndex]  # 得到这个时间点的数据
                roundTime = timeData['roundTime']  # 回合时间
                roundTimeIndex = int(24.0 - roundTime)  # 回合 时间 索引
                nodes = timeData['nodes']  # 节点
                for nodeID in nodes.keys():
                    node = nodes[nodeID]
                    # 构建回合节点
                    if nodeID not in roundNodesMap:
                        nodeObj = {
                            'teamID': node['teamID'],
                            'ID': node['ID'],
                            'xList': [],
                            'yList': [],
                            'sList': [],
                            'linkXList': [],
                            'linkYList': [],
                            'linkSList': [],
                            'linkDisList': [],
                            'linkTypeList': [],
                            'linkRoundTimeList': [],
                            'roundTimeList': [],
                            # 'linkList': [],
                            'moveInfo': [],
                        }
                        # 设置节点 聚合 时间信息
                        for i in range(25):
                            timeInfo = {
                                'roundTimeIndex': 24 - i,
                                'xList': [],
                                'yList': [],
                                'sList': [],
                                'roundTimeList': [],
                                'linkXList': [],
                                'linkYList': [],
                                'linkSList': [],
                                'linkDisList': [],
                                'linkTypeList': [],
                                'linkRoundTimeList': [],
                            }
                            nodeObj['moveInfo'].append(timeInfo)
                        roundNodesMap[nodeID] = nodeObj
                    # 存储节点信息
                    nodeObj = roundNodesMap[nodeID]
                    nodeObj['xList'].append(node['x'])
                    nodeObj['yList'].append(node['y'])
                    nodeObj['sList'].append(node['s'])
                    nodeObj['roundTimeList'].append(roundTime)
                    nodeObj['moveInfo'][roundTimeIndex]['xList'].append(node['x'])
                    nodeObj['moveInfo'][roundTimeIndex]['yList'].append(node['y'])
                    nodeObj['moveInfo'][roundTimeIndex]['sList'].append(node['s'])
                    nodeObj['moveInfo'][roundTimeIndex]['roundTimeList'].append(roundTime)
                    roundNodesMap[nodeID] = nodeObj
                    pass

                links = timeData['links']  # 连接
                for link in links:
                    linkType = link[0]
                    sID = str(link[1])
                    tID = str(link[2])
                    dis = round(link[3] / 0.3048, 4)
                    # 存储链接的 源节点 信息
                    sNodeObj = roundNodesMap[sID]
                    sNode = nodes[sID]
                    sNodeObj['linkXList'].append(sNode['x'])
                    sNodeObj['linkYList'].append(sNode['y'])
                    sNodeObj['linkSList'].append(sNode['s'])
                    sNodeObj['linkDisList'].append(dis)
                    sNodeObj['linkTypeList'].append(linkType)
                    sNodeObj['linkRoundTimeList'].append(roundTime)
                    sNodeObj['moveInfo'][roundTimeIndex]['linkXList'].append(sNode['x'])
                    sNodeObj['moveInfo'][roundTimeIndex]['linkYList'].append(sNode['y'])
                    sNodeObj['moveInfo'][roundTimeIndex]['linkSList'].append(sNode['s'])
                    sNodeObj['moveInfo'][roundTimeIndex]['linkDisList'].append(dis)
                    sNodeObj['moveInfo'][roundTimeIndex]['linkTypeList'].append(linkType)
                    sNodeObj['moveInfo'][roundTimeIndex]['linkRoundTimeList'].append(roundTime)
                    roundNodesMap[sID] = sNodeObj
                    # 存储连接的 终结点 信息
                    tNodeObj = roundNodesMap[tID]
                    tNode = nodes[tID]
                    tNodeObj['linkXList'].append(tNode['x'])
                    tNodeObj['linkYList'].append(tNode['y'])
                    tNodeObj['linkSList'].append(tNode['s'])
                    tNodeObj['linkDisList'].append(dis)
                    tNodeObj['linkTypeList'].append(linkType)
                    tNodeObj['linkRoundTimeList'].append(roundTime)
                    tNodeObj['moveInfo'][roundTimeIndex]['linkXList'].append(tNode['x'])
                    tNodeObj['moveInfo'][roundTimeIndex]['linkYList'].append(tNode['y'])
                    tNodeObj['moveInfo'][roundTimeIndex]['linkSList'].append(tNode['s'])
                    tNodeObj['moveInfo'][roundTimeIndex]['linkDisList'].append(dis)
                    tNodeObj['moveInfo'][roundTimeIndex]['linkTypeList'].append(linkType)
                    tNodeObj['moveInfo'][roundTimeIndex]['linkRoundTimeList'].append(roundTime)
                    roundNodesMap[tID] = tNodeObj

                    # 存储link信息
                    linkKey = sID + '_' + tID
                    if linkKey not in roundLinksMap:
                        linkObj = {
                            's': link[1],  # 起点
                            't': link[2],  # 终点
                            'disList': [],
                            'sXList': [],
                            'sYList': [],
                            'sSList': [],
                            'tXList': [],
                            'tYList': [],
                            'tSList': [],
                            'roundTimeList': [],
                            'linkInfo': []
                        }
                        for i in range(25):
                            linkTimeInfo = {
                                'roundTimeIndex': 24 - i,
                                'disList': [],
                                'sXList': [],
                                'sYList': [],
                                'sSList': [],
                                'tXList': [],
                                'tYList': [],
                                'tSList': [],
                                'roundTimeList': [],
                            }
                            linkObj['linkInfo'].append(linkTimeInfo)
                        roundLinksMap[linkKey] = linkObj
                    linkObj = roundLinksMap[linkKey]
                    linkObj['disList'].append(dis)
                    linkObj['sXList'].append(sNode['x'])
                    linkObj['sYList'].append(sNode['y'])
                    linkObj['sSList'].append(sNode['s'])
                    linkObj['tXList'].append(tNode['x'])
                    linkObj['tYList'].append(tNode['y'])
                    linkObj['tSList'].append(tNode['s'])
                    linkObj['roundTimeList'].append(roundTime)
                    linkObj['linkInfo'][roundTimeIndex]['disList'].append(dis)
                    linkObj['linkInfo'][roundTimeIndex]['sXList'].append(sNode['x'])
                    linkObj['linkInfo'][roundTimeIndex]['sYList'].append(sNode['y'])
                    linkObj['linkInfo'][roundTimeIndex]['sSList'].append(sNode['s'])
                    linkObj['linkInfo'][roundTimeIndex]['tXList'].append(tNode['x'])
                    linkObj['linkInfo'][roundTimeIndex]['tYList'].append(tNode['y'])
                    linkObj['linkInfo'][roundTimeIndex]['tSList'].append(tNode['s'])
                    linkObj['linkInfo'][roundTimeIndex]['roundTimeList'].append(roundTime)
                    roundLinksMap[linkKey] = linkObj
            # 整理 节点 和 连接, 把 map 换成 列表
            roundNodesList = []
            roundLinksList = []
            averageRoundInSecondsData(roundNodesMap, roundLinksMap)
            # 保存 这个 回合 节点 和 连接
            quarterList.append({'nodes': roundNodesList, 'links': roundLinksList})
        gameList.append(quarterList)
    data['data'] = gameList
    return data


def getRoundGraphListV2(data):
    # 比赛数据
    gameData = data['data']

    gameList = []
    for quarterIndex in range(len(gameData)):
        quarterData = gameData[quarterIndex]  # 得到 这个小节的 数据
        quarterList = []
        for roundIndex in range(len(quarterData)):
            roundData = quarterData[roundIndex]  # 得到 这个回合 的数据
            roundNodesMap = {}
            roundLinksMap = {}
            for timeIndex in range(len(roundData)):
                timeData = roundData[timeIndex]  # 得到这个时间点的数据
                roundTime = timeData['roundTime']  # 回合时间
                roundTimeIndex = int(roundTime)  # 回合 时间 索引
                roundTimeKey = str(roundTimeIndex)  # 回合 时间 索引
                # 节点
                nodes = timeData['nodes']  # 节点
                for nodeID in nodes.keys():
                    node = nodes[nodeID]
                    # 构建回合节点
                    if nodeID not in roundNodesMap.keys():
                        nodeObj = {  # 节点对象
                            'teamID': node['teamID'],  # 队伍id
                            'ID': node['ID'],  # 球员id
                            'secondInfo': {}  # 以秒为单位的聚合信息，后期要对每一秒内的数据 进行 求 平均
                        }
                        for second in range(0, 25):
                            secondObj = {
                                'secondScale': second,  # 第几秒
                                'xList': [],  # x
                                'yList': [],  # y
                                'sList': [],  # s
                                'roundTimeList': [],  # 回合时间
                                'linkXList': [],  # 发生连接时 x
                                'linkYList': [],  # 发生连接时 y
                                'linkSList': [],  # 发生连接时 s
                                'linkDisList': [],  # 发生连接时 dis
                                'linkPlayerIDList': [],  # 发生连接时 连接对象
                                'linkRoundTimeList': []  # 发生连接时 回合时间
                            }
                            secondKey = str(second)
                            nodeObj['secondInfo'][secondKey] = secondObj
                        roundNodesMap[nodeID] = nodeObj
                    # 存储当前节点信息
                    nodeObj = roundNodesMap[nodeID]
                    # 找到这个时刻的对象 以秒为单位 做一个聚合
                    secondObj = nodeObj['secondInfo'][roundTimeKey]
                    # 保存 这个节点 在这一秒 内的 x y speed 回合时间
                    secondObj['xList'].append(node['x'])
                    secondObj['yList'].append(node['y'])
                    secondObj['sList'].append(node['s'])
                    secondObj['roundTimeList'].append(roundTime)
                    nodeObj['secondInfo'][roundTimeKey] = secondObj
                    roundNodesMap[nodeID] = nodeObj

                links = timeData['links']
                for link in links:
                    # 连接 起点 终点 距离
                    sID = str(link[1])
                    tID = str(link[2])
                    dis = link[3]
                    # 起点 和 终点 信息
                    sNode = nodes[sID]
                    tNode = nodes[tID]
                    # 回合节点Map 内的 起点和终点信息
                    sRoundNode = roundNodesMap[sID]
                    tRoundNode = roundNodesMap[tID]
                    # 起点
                    sRoundNode['secondInfo'][roundTimeKey]['linkXList'].append(sNode['x'])
                    sRoundNode['secondInfo'][roundTimeKey]['linkYList'].append(sNode['y'])
                    sRoundNode['secondInfo'][roundTimeKey]['linkSList'].append(sNode['s'])
                    sRoundNode['secondInfo'][roundTimeKey]['linkDisList'].append(dis)
                    sRoundNode['secondInfo'][roundTimeKey]['linkPlayerIDList'].append(link[2])
                    sRoundNode['secondInfo'][roundTimeKey]['linkRoundTimeList'].append(roundTime)
                    # 终点
                    tRoundNode['secondInfo'][roundTimeKey]['linkXList'].append(tNode['x'])
                    tRoundNode['secondInfo'][roundTimeKey]['linkYList'].append(tNode['y'])
                    tRoundNode['secondInfo'][roundTimeKey]['linkSList'].append(tNode['s'])
                    tRoundNode['secondInfo'][roundTimeKey]['linkDisList'].append(dis)
                    tRoundNode['secondInfo'][roundTimeKey]['linkPlayerIDList'].append(link[1])
                    tRoundNode['secondInfo'][roundTimeKey]['linkRoundTimeList'].append(roundTime)

                    # 保存链接信息
                    linkKey = sID + '-' + tID
                    if linkKey not in roundLinksMap:
                        linkObj = {
                            's': link[1],  # 起点
                            't': link[2],  # 终点
                            'linkNum': 0,
                            'disList': [],
                            'secondInfo': {}
                        }
                        for second in range(0, 25):
                            linkTimeInfo = {
                                'secondScale': second,
                                'disList': [],
                                'sXList': [],
                                'sYList': [],
                                'sSList': [],
                                'tXList': [],
                                'tYList': [],
                                'tSList': [],
                                'roundTimeList': [],
                            }
                            linkObj['secondInfo'][str(second)] = linkTimeInfo
                        roundLinksMap[linkKey] = linkObj
                    # 得到 连接
                    linkObj = roundLinksMap[linkKey]
                    linkObj['linkNum'] = linkObj['linkNum'] + 1
                    linkObj['disList'].append(dis)
                    linkObj['secondInfo'][roundTimeKey]['disList'].append(dis)
                    linkObj['secondInfo'][roundTimeKey]['sXList'].append(sNode['x'])
                    linkObj['secondInfo'][roundTimeKey]['sYList'].append(sNode['y'])
                    linkObj['secondInfo'][roundTimeKey]['sSList'].append(sNode['s'])
                    linkObj['secondInfo'][roundTimeKey]['tXList'].append(tNode['x'])
                    linkObj['secondInfo'][roundTimeKey]['tYList'].append(tNode['y'])
                    linkObj['secondInfo'][roundTimeKey]['tSList'].append(tNode['s'])
                    linkObj['secondInfo'][roundTimeKey]['roundTimeList'].append(roundTime)
                    roundLinksMap[linkKey] = linkObj
            # 保存这个回合的内容
            roundNodesList, roundLinksList = averageRoundInSecondsData(roundNodesMap, roundLinksMap)
            quarterList.append({'nodes': roundNodesList, 'links': roundLinksList})
        gameList.append(quarterList)
    data['data'] = gameList
    return data


def getRoundGraphListV3(data):
    # 比赛数据
    gameData = data['data']

    gameList = []
    for quarterIndex in range(len(gameData)):
        quarterData = gameData[quarterIndex]  # 得到 这个小节的 数据
        quarterList = []
        for roundIndex in range(len(quarterData)):
            roundData = quarterData[roundIndex]  # 得到 这个回合 的数据
            roundNodesMap = {}
            roundLinksMap = {}
            for timeIndex in range(len(roundData)):
                timeData = roundData[timeIndex]  # 得到这个时间点的数据
                roundTime = timeData['roundTime']  # 回合时间
                roundTimeIndex = int(roundTime)  # 回合 时间 索引
                roundTimeKey = str(roundTimeIndex)  # 回合 时间 索引
                # 节点
                nodes = timeData['nodes']  # 节点
                for nodeID in nodes.keys():
                    if nodeID == '-1':
                        continue
                    node = nodes[nodeID]
                    # 构建回合节点
                    if nodeID not in roundNodesMap.keys():
                        nodeObj = {  # 节点对象
                            'teamID': node['teamID'],  # 队伍id
                            'ID': node['ID'],  # 球员id
                            'secondInfo': {}  # 以秒为单位的聚合信息，后期要对每一秒内的数据 进行 求 平均
                        }
                        for second in range(0, 25):
                            secondObj = {
                                'secondScale': second,  # 第几秒
                                'xList': [],  # x
                                'yList': [],  # y
                                'sList': [],  # s
                                'roundTimeList': [],  # 回合时间
                                'linkXList': [],  # 发生连接时 x
                                'linkYList': [],  # 发生连接时 y
                                'linkSList': [],  # 发生连接时 s
                                'linkDisList': [],  # 发生连接时 dis
                                'linkPlayerIDList': [],  # 发生连接时 连接对象
                                'linkRoundTimeList': []  # 发生连接时 回合时间
                            }
                            secondKey = str(second)
                            nodeObj['secondInfo'][secondKey] = secondObj
                        roundNodesMap[nodeID] = nodeObj
                    # 存储当前节点信息
                    nodeObj = roundNodesMap[nodeID]
                    # 找到这个时刻的对象 以秒为单位 做一个聚合
                    secondObj = nodeObj['secondInfo'][roundTimeKey]
                    # 保存 这个节点 在这一秒 内的 x y speed 回合时间
                    secondObj['xList'].append(node['x'])
                    secondObj['yList'].append(node['y'])
                    secondObj['sList'].append(node['s'])
                    secondObj['roundTimeList'].append(roundTime)
                    nodeObj['secondInfo'][roundTimeKey] = secondObj
                    roundNodesMap[nodeID] = nodeObj

                links = timeData['links']
                for link in links:
                    # 连接 起点 终点 距离
                    sID = str(link[1])
                    tID = str(link[2])
                    if sID == '-1' or tID == '-1':
                        continue
                    dis = link[3]
                    # 起点 和 终点 信息
                    sNode = nodes[sID]
                    tNode = nodes[tID]
                    # 回合节点Map 内的 起点和终点信息
                    sRoundNode = roundNodesMap[sID]
                    tRoundNode = roundNodesMap[tID]
                    # 起点
                    sRoundNode['secondInfo'][roundTimeKey]['linkXList'].append(sNode['x'])
                    sRoundNode['secondInfo'][roundTimeKey]['linkYList'].append(sNode['y'])
                    sRoundNode['secondInfo'][roundTimeKey]['linkSList'].append(sNode['s'])
                    sRoundNode['secondInfo'][roundTimeKey]['linkDisList'].append(dis)
                    sRoundNode['secondInfo'][roundTimeKey]['linkPlayerIDList'].append(link[2])
                    sRoundNode['secondInfo'][roundTimeKey]['linkRoundTimeList'].append(roundTime)
                    # 终点
                    tRoundNode['secondInfo'][roundTimeKey]['linkXList'].append(tNode['x'])
                    tRoundNode['secondInfo'][roundTimeKey]['linkYList'].append(tNode['y'])
                    tRoundNode['secondInfo'][roundTimeKey]['linkSList'].append(tNode['s'])
                    tRoundNode['secondInfo'][roundTimeKey]['linkDisList'].append(dis)
                    tRoundNode['secondInfo'][roundTimeKey]['linkPlayerIDList'].append(link[1])
                    tRoundNode['secondInfo'][roundTimeKey]['linkRoundTimeList'].append(roundTime)

                    # 保存链接信息
                    linkKey = sID + '-' + tID
                    if linkKey not in roundLinksMap:
                        linkObj = {
                            's': link[1],  # 起点
                            't': link[2],  # 终点
                            'linkNum': 0,
                            'disList': [],
                            'secondInfo': {}
                        }
                        for second in range(0, 25):
                            linkTimeInfo = {
                                'secondScale': second,
                                'disList': [],
                                'sXList': [],
                                'sYList': [],
                                'sSList': [],
                                'tXList': [],
                                'tYList': [],
                                'tSList': [],
                                'roundTimeList': [],
                            }
                            linkObj['secondInfo'][str(second)] = linkTimeInfo
                        roundLinksMap[linkKey] = linkObj
                    # 得到 连接
                    linkObj = roundLinksMap[linkKey]
                    linkObj['linkNum'] = linkObj['linkNum'] + 1
                    linkObj['disList'].append(dis)
                    linkObj['secondInfo'][roundTimeKey]['disList'].append(dis)
                    linkObj['secondInfo'][roundTimeKey]['sXList'].append(sNode['x'])
                    linkObj['secondInfo'][roundTimeKey]['sYList'].append(sNode['y'])
                    linkObj['secondInfo'][roundTimeKey]['sSList'].append(sNode['s'])
                    linkObj['secondInfo'][roundTimeKey]['tXList'].append(tNode['x'])
                    linkObj['secondInfo'][roundTimeKey]['tYList'].append(tNode['y'])
                    linkObj['secondInfo'][roundTimeKey]['tSList'].append(tNode['s'])
                    linkObj['secondInfo'][roundTimeKey]['roundTimeList'].append(roundTime)
                    roundLinksMap[linkKey] = linkObj
            # 保存这个回合的内容
            roundNodesList, roundLinksList = averageRoundInSecondsData(roundNodesMap, roundLinksMap)
            quarterList.append(
                {'nodes': roundNodesList, 'links': roundLinksList,
                 'quarterIndex': roundData[0]['quarterIndex'],
                 'startQuarterTime': roundData[0]['quarterTime'], 'endQuarterTime': roundData[-1]['quarterTime'],
                 'roundIndex': roundData[0]['roundIndex'],
                 'startRoundTime': roundData[0]['roundTime'], 'endRoundTime': roundData[-1]['roundTime']})
        gameList.append(quarterList)
    data['data'] = gameList
    return data


# 对回合内的数据基于每一秒求平均值和中位数
def averageRoundInSecondsData(roundNodesMap, roundLinksMap):
    roundNodesList = []
    roundLinksList = []
    # 遍历节点
    for nodeID in roundNodesMap.keys():
        nodeObj = roundNodesMap[nodeID]
        secondList = []
        for secondKey in nodeObj['secondInfo'].keys():
            secondObj = nodeObj['secondInfo'][secondKey]
            if len(secondObj['xList']) == 0:
                continue
            xList = secondObj['xList']
            yList = secondObj['yList']
            sList = secondObj['sList']
            roundTimeList = secondObj['roundTimeList']
            linkXList = secondObj['linkXList']
            linkYList = secondObj['linkYList']
            linkSList = secondObj['linkSList']
            linkDisList = secondObj['linkDisList']
            linkPlayerIDList = secondObj['linkPlayerIDList']
            linkRoundTimeList = secondObj['linkRoundTimeList']
            # 求节点的平均值
            x = np.mean(xList)
            y = np.mean(yList)
            s = np.mean(sList)
            roundTime = np.mean(roundTimeList)
            linkX = np.mean(linkXList)
            linkY = np.mean(linkYList)
            linkS = np.mean(linkSList)
            linkNum = len(linkDisList)
            linkDis = np.mean(linkDisList)
            linkPlayerIDList = list(set(linkPlayerIDList))
            linkRoundTime = np.mean(linkRoundTimeList)
            # 经过每一秒简化的 回合 信息, 把计算的平均值计算进去
            newSecondObj = {
                'secondScale': secondObj['secondScale'],
                'x': x,
                'y': y,
                's': s,
                'roundTime': roundTime,
                'linkX': linkX,
                'linkY': linkY,
                'linkS': linkS,
                'linkNum': linkNum,
                'linkDis': linkDis,
                'linkPlayerIDList': linkPlayerIDList,
                'linkRoundTime': linkRoundTime,
                'timeNum': len(roundTimeList)
            }
            secondList.append(newSecondObj)
        secondList = sorted(secondList, key=lambda e: e['secondScale'], reverse=True)
        nodeObj['secondInfo'] = secondList
        roundNodesList.append(nodeObj)
    # 整理 连接
    for key in roundLinksMap.keys():
        linkObj = roundLinksMap[key]
        secondInfo = linkObj['secondInfo']
        secondList = []
        for secondKey in secondInfo.keys():
            secondObj = secondInfo[secondKey]
            newSecondObj = {}
            if len(secondObj['roundTimeList']) == 0:
                continue
            # 求平均
            newSecondObj['secondScale'] = secondObj['secondScale']
            newSecondObj['dis'] = np.mean(secondObj['disList'])
            newSecondObj['num'] = len(secondObj['disList'])
            newSecondObj['sX'] = np.mean(secondObj['sXList'])
            newSecondObj['sY'] = np.mean(secondObj['sYList'])
            newSecondObj['sS'] = np.mean(secondObj['sSList'])
            newSecondObj['tX'] = np.mean(secondObj['tXList'])
            newSecondObj['tY'] = np.mean(secondObj['tYList'])
            newSecondObj['tS'] = np.mean(secondObj['tSList'])
            newSecondObj['roundTime'] = np.mean(secondObj['roundTimeList'])

            secondList.append(newSecondObj)

        # 排序
        secondList = sorted(secondList, key=lambda e: e['secondScale'], reverse=True)

        linkObj['secondInfo'] = secondList
        # del linkObj['second']
        roundLinksList.append(linkObj)
    return roundNodesList, roundLinksList


# 得到小节数据
def getQuarterGraphList(data):
    # 比赛数据
    gameData = data['data']

    gameList = []
    for quarterIndex in range(len(gameData)):
        quarterData = gameData[quarterIndex]  # 得到 这个小节的 数据
        quarterList = []
        quarterNodesMap = {}
        quarterLinksMap = {}
        for roundIndex in range(len(quarterData)):
            roundData = quarterData[roundIndex]  # 得到 这个回合 的数据
            roundKey = str(roundIndex)  # 这个回合的信息
            # roundNodesMap = {}
            # roundLinksMap = {}
            for timeIndex in range(len(roundData)):
                timeData = roundData[timeIndex]  # 得到这个时间点的数据
                roundTime = timeData['roundTime']  # 回合时间
                roundTimeIndex = int(roundTime)  # 回合 时间 索引
                roundTimeKey = str(roundTimeIndex)  # 回合 时间 索引
                nodes = timeData['nodes']  # 时间 所有的节点
                links = timeData['links']  # 时间 所有的连接
                # 对节点进行操作
                for nodeID in nodes.keys():  # 遍历 节点
                    node = nodes[nodeID]  # 得到一个节点
                    # 判断 小节 信息里有没有这个节点的信息，没有这个节点信息 就 好好添加这个节点
                    if nodeID not in quarterNodesMap:
                        nodeObj = {  # 节点对象
                            'teamID': node['teamID'],  # 队伍id
                            'ID': node['ID'],  # 球员id
                            'roundInfo': {}  # 以秒为单位的聚合信息，后期要对每一秒内的数据 进行 求 平均
                        }
                        for i in range(200):
                            roundObj = {
                                'roundIndex': i,
                                'xList': [],
                                'yList': [],
                                'sList': [],
                                'roundTimeList': [],
                                'linkXList': [],
                                'linkYList': [],
                                'linkSList': [],
                                'linkDisList': [],
                                'linkPlayerIDList': [],
                                'linkRoundTimeList': [],
                            }
                            nodeObj['roundInfo'][str(i)] = roundObj
                        quarterNodesMap[nodeID] = nodeObj
                    # 存储这个节点的信息
                    nodeObj = quarterNodesMap[nodeID]  # 得到 这个节点信息
                    nodeObj['roundInfo'][roundKey]['xList'].append(node['x'])
                    nodeObj['roundInfo'][roundKey]['yList'].append(node['y'])
                    nodeObj['roundInfo'][roundKey]['sList'].append(node['s'])
                    nodeObj['roundInfo'][roundKey]['roundTimeList'].append(roundTime)
                # 对 连接 操作
                for link in links:
                    # 连接 起点 终点 距离
                    sID = str(link[1])
                    tID = str(link[2])
                    dis = link[3]
                    # 起点 和 终点 信息
                    sNode = nodes[sID]
                    tNode = nodes[tID]
                    # 回合节点Map 内的 起点和终点信息
                    sNodeObj = quarterNodesMap[sID]
                    tNodeObj = quarterNodesMap[tID]
                    # 操作 起点 和 终点
                    sNodeObj['roundInfo'][roundKey]['linkXList'].append(sNode['x'])
                    sNodeObj['roundInfo'][roundKey]['linkYList'].append(sNode['y'])
                    sNodeObj['roundInfo'][roundKey]['linkSList'].append(sNode['s'])
                    sNodeObj['roundInfo'][roundKey]['linkDisList'].append(dis)
                    sNodeObj['roundInfo'][roundKey]['linkPlayerIDList'].append(link[2])
                    sNodeObj['roundInfo'][roundKey]['linkRoundTimeList'].append(roundTime)
                    tNodeObj['roundInfo'][roundKey]['linkXList'].append(tNode['x'])
                    tNodeObj['roundInfo'][roundKey]['linkYList'].append(tNode['y'])
                    tNodeObj['roundInfo'][roundKey]['linkSList'].append(tNode['s'])
                    tNodeObj['roundInfo'][roundKey]['linkDisList'].append(dis)
                    tNodeObj['roundInfo'][roundKey]['linkPlayerIDList'].append(link[1])
                    tNodeObj['roundInfo'][roundKey]['linkRoundTimeList'].append(roundTime)
                    # 操作连接
                    linkKey = sID + '-' + tID
                    if linkKey not in quarterLinksMap:
                        linkObj = {
                            's': link[1],  # 起点
                            't': link[2],  # 终点
                            'linkNum': 0,
                            'disList': [],
                            'roundInfo': {}
                        }
                        for i in range(200):
                            linkTimeInfo = {
                                'roundIndex': i,
                                'disList': [],
                                'sXList': [],
                                'sYList': [],
                                'sSList': [],
                                'tXList': [],
                                'tYList': [],
                                'tSList': [],
                                'roundTimeList': [],
                            }
                            linkObj['roundInfo'][str(i)] = linkTimeInfo
                        quarterLinksMap[linkKey] = linkObj

                        pass
                    # 得到连接
                    linkObj = quarterLinksMap[linkKey]
                    linkObj['linkNum'] = linkObj['linkNum'] + 1
                    linkObj['disList'].append(dis)
                    linkObj['roundInfo'][roundKey]['disList'].append(dis)
                    linkObj['roundInfo'][roundKey]['sXList'].append(sNode['x'])
                    linkObj['roundInfo'][roundKey]['sYList'].append(sNode['y'])
                    linkObj['roundInfo'][roundKey]['sSList'].append(sNode['s'])
                    linkObj['roundInfo'][roundKey]['tXList'].append(tNode['x'])
                    linkObj['roundInfo'][roundKey]['tYList'].append(tNode['y'])
                    linkObj['roundInfo'][roundKey]['tSList'].append(tNode['s'])
                    linkObj['roundInfo'][roundKey]['roundTimeList'].append(roundTime)
                    quarterLinksMap[linkKey] = linkObj

        quarterNodesList, quarterLinksList = averageQuarterInRoundsData(quarterNodesMap, quarterLinksMap)
        gameList.append({'nodes': quarterNodesList, 'links': quarterLinksList})

    data['data'] = gameList
    return data


def getQuarterGraphListV2(data):
    # 比赛数据
    gameData = data['data']

    gameList = []
    for quarterIndex in range(len(gameData)):
        quarterData = gameData[quarterIndex]  # 得到 这个小节的 数据
        quarterList = []
        quarterNodesMap = {}
        quarterLinksMap = {}
        for roundIndex in range(len(quarterData)):
            roundData = quarterData[roundIndex]  # 得到 这个回合 的数据
            roundKey = str(roundIndex)  # 这个回合的信息
            # roundNodesMap = {}
            # roundLinksMap = {}
            for timeIndex in range(len(roundData)):
                timeData = roundData[timeIndex]  # 得到这个时间点的数据
                roundTime = timeData['roundTime']  # 回合时间
                roundTimeIndex = int(roundTime)  # 回合 时间 索引
                roundTimeKey = str(roundTimeIndex)  # 回合 时间 索引
                nodes = timeData['nodes']  # 时间 所有的节点
                links = timeData['links']  # 时间 所有的连接
                # 对节点进行操作
                for nodeID in nodes.keys():  # 遍历 节点
                    if nodeID == '-1':  # 去 球 节点
                        continue
                    node = nodes[nodeID]  # 得到一个节点
                    # 判断 小节 信息里有没有这个节点的信息，没有这个节点信息 就 好好添加这个节点
                    if nodeID not in quarterNodesMap:
                        nodeObj = {  # 节点对象
                            'teamID': node['teamID'],  # 队伍id
                            'ID': node['ID'],  # 球员id
                            'roundInfo': {}  # 以秒为单位的聚合信息，后期要对每一秒内的数据 进行 求 平均
                        }
                        for i in range(200):
                            roundObj = {
                                'roundIndex': i,
                                'xList': [],
                                'yList': [],
                                'sList': [],
                                'roundTimeList': [],
                                'linkXList': [],
                                'linkYList': [],
                                'linkSList': [],
                                'linkDisList': [],
                                'linkPlayerIDList': [],
                                'linkRoundTimeList': [],
                            }
                            nodeObj['roundInfo'][str(i)] = roundObj
                        quarterNodesMap[nodeID] = nodeObj
                    # 存储这个节点的信息
                    nodeObj = quarterNodesMap[nodeID]  # 得到 这个节点信息
                    nodeObj['roundInfo'][roundKey]['xList'].append(node['x'])
                    nodeObj['roundInfo'][roundKey]['yList'].append(node['y'])
                    nodeObj['roundInfo'][roundKey]['sList'].append(node['s'])
                    nodeObj['roundInfo'][roundKey]['roundTimeList'].append(roundTime)
                # 对 连接 操作
                for link in links:
                    # 连接 起点 终点 距离
                    sID = str(link[1])
                    tID = str(link[2])
                    dis = link[3]
                    if sID == '-1' or tID == '-1':
                        continue

                    # 起点 和 终点 信息
                    sNode = nodes[sID]
                    tNode = nodes[tID]
                    # 回合节点Map 内的 起点和终点信息
                    sNodeObj = quarterNodesMap[sID]
                    tNodeObj = quarterNodesMap[tID]
                    # 操作 起点 和 终点
                    sNodeObj['roundInfo'][roundKey]['linkXList'].append(sNode['x'])
                    sNodeObj['roundInfo'][roundKey]['linkYList'].append(sNode['y'])
                    sNodeObj['roundInfo'][roundKey]['linkSList'].append(sNode['s'])
                    sNodeObj['roundInfo'][roundKey]['linkDisList'].append(dis)
                    sNodeObj['roundInfo'][roundKey]['linkPlayerIDList'].append(link[2])
                    sNodeObj['roundInfo'][roundKey]['linkRoundTimeList'].append(roundTime)
                    tNodeObj['roundInfo'][roundKey]['linkXList'].append(tNode['x'])
                    tNodeObj['roundInfo'][roundKey]['linkYList'].append(tNode['y'])
                    tNodeObj['roundInfo'][roundKey]['linkSList'].append(tNode['s'])
                    tNodeObj['roundInfo'][roundKey]['linkDisList'].append(dis)
                    tNodeObj['roundInfo'][roundKey]['linkPlayerIDList'].append(link[1])
                    tNodeObj['roundInfo'][roundKey]['linkRoundTimeList'].append(roundTime)
                    # 操作连接
                    linkKey = sID + '-' + tID
                    if linkKey not in quarterLinksMap:
                        linkObj = {
                            's': link[1],  # 起点
                            't': link[2],  # 终点
                            'linkNum': 0,
                            'disList': [],
                            'roundInfo': {}
                        }
                        for i in range(200):
                            linkTimeInfo = {
                                'roundIndex': i,
                                'disList': [],
                                'sXList': [],
                                'sYList': [],
                                'sSList': [],
                                'tXList': [],
                                'tYList': [],
                                'tSList': [],
                                'roundTimeList': [],
                            }
                            linkObj['roundInfo'][str(i)] = linkTimeInfo
                        quarterLinksMap[linkKey] = linkObj

                        pass
                    # 得到连接
                    linkObj = quarterLinksMap[linkKey]
                    linkObj['linkNum'] = linkObj['linkNum'] + 1
                    linkObj['disList'].append(dis)
                    linkObj['roundInfo'][roundKey]['disList'].append(dis)
                    linkObj['roundInfo'][roundKey]['sXList'].append(sNode['x'])
                    linkObj['roundInfo'][roundKey]['sYList'].append(sNode['y'])
                    linkObj['roundInfo'][roundKey]['sSList'].append(sNode['s'])
                    linkObj['roundInfo'][roundKey]['tXList'].append(tNode['x'])
                    linkObj['roundInfo'][roundKey]['tYList'].append(tNode['y'])
                    linkObj['roundInfo'][roundKey]['tSList'].append(tNode['s'])
                    linkObj['roundInfo'][roundKey]['roundTimeList'].append(roundTime)
                    quarterLinksMap[linkKey] = linkObj

        quarterNodesList, quarterLinksList = averageQuarterInRoundsData(quarterNodesMap, quarterLinksMap)
        gameList.append({'nodes': quarterNodesList, 'links': quarterLinksList})

    data['data'] = gameList
    return data



def averageQuarterInRoundsData(quarterNodesMap, quarterLinksMap):
    quarterNodesList = []
    quarterLinksList = []
    # 操作节点
    for nodeID in quarterNodesMap.keys():
        nodeObj = quarterNodesMap[nodeID]
        roundInfo = nodeObj['roundInfo']
        roundList = []
        for roundKey in roundInfo.keys():
            roundObj = roundInfo[roundKey]
            if len(roundObj['xList']) == 0:
                continue
            xList = roundObj['xList']
            xInfo = getStatisticData(xList)
            yList = roundObj['yList']
            yInfo = getStatisticData(yList)
            sList = roundObj['sList']
            sInfo = getStatisticData(sList)
            roundTimeList = roundObj['roundTimeList']
            roundTimeInfo = getStatisticData(roundTimeList)
            linkXList = roundObj['linkXList']
            linkXInfo = getStatisticData(linkXList)
            linkYList = roundObj['linkYList']
            linkYInfo = getStatisticData(linkYList)
            linkSList = roundObj['linkSList']
            linkSInfo = getStatisticData(linkSList)
            linkDisList = roundObj['linkDisList']
            linkDisInfo = getStatisticData(linkDisList)
            linkNum = len(linkDisList)
            linkPlayerIDList = list(set(roundObj['linkPlayerIDList']))
            linkRoundTimeList = roundObj['linkRoundTimeList']
            linkRoundTimeInfo = getStatisticData(linkRoundTimeList)
            newRoundObj = {
                'roundIndex': roundObj['roundIndex'],
                'xInfo': xInfo,
                'yInfo': yInfo,
                'sInfo': sInfo,
                'roundTimeInfo': roundTimeInfo,
                'linkXInfo': linkXInfo,
                'linkYInfo': linkYInfo,
                'linkSInfo': linkSInfo,
                'linkDisInfo': linkDisInfo,
                'linkNum': linkNum,
                'linkPlayerIDList': linkPlayerIDList,
                'linkRoundTimeInfo': linkRoundTimeInfo,
                'timeNum': len(xList)
            }
            roundList.append(newRoundObj)
        nodeObj['roundInfo'] = roundList
        quarterNodesList.append(nodeObj)
    # 操作 连接
    for linkKey in quarterLinksMap.keys():
        linkObj = quarterLinksMap[linkKey]
        linkObj['disList'] = getStatisticData(linkObj['disList'])
        roundList = []
        for key in linkObj['roundInfo'].keys():
            roundObj = linkObj['roundInfo'][key]

            if len(roundObj['disList']) == 0:
                continue
            newRoundObj = {
                'roundIndex': roundObj['roundIndex'],
                'disInfo': getStatisticData(roundObj['disList']),
                'sXInfo': getStatisticData(roundObj['sXList']),
                'sYInfo': getStatisticData(roundObj['sYList']),
                'sSInfo': getStatisticData(roundObj['sSList']),
                'tXInfo': getStatisticData(roundObj['tXList']),
                'tYInfo': getStatisticData(roundObj['tYList']),
                'tSInfo': getStatisticData(roundObj['tSList']),
                'roundTimeInfo': getStatisticData(roundObj['roundTimeList']),
                'linkNum': len(roundObj['disList'])
            }
            roundList.append(newRoundObj)
        linkObj['roundInfo'] = roundList
        quarterLinksList.append(linkObj)

    return quarterNodesList, quarterNodesList


def getGameGraphList(data):
    # 比赛数据
    gameData = data['data']

    # 比赛节点 和 连接
    gameNodesMap = {}
    gameLinksMap = {}
    for quarterIndex in range(len(gameData)):
        quarterKey = str(quarterIndex)  # 小节 的 key
        quarterData = gameData[quarterIndex]  # 得到 这个小节的 数据
        quarterList = []
        quarterNodesMap = {}
        quarterLinksMap = {}
        for roundIndex in range(len(quarterData)):
            roundData = quarterData[roundIndex]  # 得到 这个回合 的数据
            roundKey = str(roundIndex)  # 这个回合的信息
            # roundNodesMap = {}
            # roundLinksMap = {}
            for timeIndex in range(len(roundData)):
                timeData = roundData[timeIndex]  # 得到这个时间点的数据
                quarterTime = timeData['quarterTime']
                roundTime = timeData['roundTime']  # 回合时间
                roundTimeIndex = int(roundTime)  # 回合 时间 索引
                roundTimeKey = str(roundTimeIndex)  # 回合 时间 索引
                nodes = timeData['nodes']  # 时间 所有的节点
                links = timeData['links']  # 时间 所有的连接
                # 对节点进行操作
                for nodeID in nodes.keys():  # 遍历 节点
                    node = nodes[nodeID]  # 得到一个节点
                    # 判断 比赛里有没有这个节点
                    if nodeID not in gameNodesMap:
                        nodeObj = {  # 节点对象
                            'teamID': node['teamID'],  # 队伍id
                            'ID': node['ID'],  # 球员id
                            'quarterInfo': {}  # 以秒为单位的聚合信息，后期要对每一秒内的数据 进行 求 平均
                        }
                        for i in range(10):
                            quarterObj = {
                                'quarterIndex': i,
                                'xList': [],
                                'yList': [],
                                'sList': [],
                                'quarterTimeList': [],
                                'linkXList': [],
                                'linkYList': [],
                                'linkSList': [],
                                'linkDisList': [],
                                'linkPlayerIDList': [],
                                'linkQuarterTimeList': [],
                            }
                            nodeObj['quarterInfo'][str(i)] = quarterObj
                        gameNodesMap[nodeID] = nodeObj
                    # 存储这个节点的信息
                    nodeObj = gameNodesMap[nodeID]  # 得到 这个节点信息
                    nodeObj['quarterInfo'][quarterKey]['xList'].append(node['x'])
                    nodeObj['quarterInfo'][quarterKey]['yList'].append(node['y'])
                    nodeObj['quarterInfo'][quarterKey]['sList'].append(node['s'])
                    nodeObj['quarterInfo'][quarterKey]['quarterTimeList'].append(quarterTime)
                # 对 连接 操作
                for link in links:
                    # 连接 起点 终点 距离
                    sID = str(link[1])
                    tID = str(link[2])
                    dis = link[3]
                    # 起点 和 终点 信息
                    sNode = nodes[sID]
                    tNode = nodes[tID]
                    # 回合节点Map 内的 起点和终点信息
                    sNodeObj = gameNodesMap[sID]
                    tNodeObj = gameNodesMap[tID]
                    # 操作 起点 和 终点
                    sNodeObj['quarterInfo'][quarterKey]['linkXList'].append(sNode['x'])
                    sNodeObj['quarterInfo'][quarterKey]['linkYList'].append(sNode['y'])
                    sNodeObj['quarterInfo'][quarterKey]['linkSList'].append(sNode['s'])
                    sNodeObj['quarterInfo'][quarterKey]['linkDisList'].append(dis)
                    sNodeObj['quarterInfo'][quarterKey]['linkPlayerIDList'].append(link[2])
                    sNodeObj['quarterInfo'][quarterKey]['linkQuarterTimeList'].append(quarterTime)
                    tNodeObj['quarterInfo'][quarterKey]['linkXList'].append(tNode['x'])
                    tNodeObj['quarterInfo'][quarterKey]['linkYList'].append(tNode['y'])
                    tNodeObj['quarterInfo'][quarterKey]['linkSList'].append(tNode['s'])
                    tNodeObj['quarterInfo'][quarterKey]['linkDisList'].append(dis)
                    tNodeObj['quarterInfo'][quarterKey]['linkPlayerIDList'].append(link[1])
                    tNodeObj['quarterInfo'][quarterKey]['linkQuarterTimeList'].append(quarterTime)
                    gameNodesMap[sID] = sNodeObj
                    gameNodesMap[tID] = tNodeObj
                    # 操作连接
                    linkKey = sID + '-' + tID
                    if linkKey not in gameLinksMap:
                        linkObj = {
                            's': link[1],  # 起点
                            't': link[2],  # 终点
                            'linkNum': 0,
                            'disList': [],
                            'quarterInfo': {}
                        }
                        for i in range(10):
                            linkTimeInfo = {
                                'quarterIndex': i,
                                'disList': [],
                                'sXList': [],
                                'sYList': [],
                                'sSList': [],
                                'tXList': [],
                                'tYList': [],
                                'tSList': [],
                                'quarterTimeList': [],
                            }
                            linkObj['quarterInfo'][str(i)] = linkTimeInfo
                        gameLinksMap[linkKey] = linkObj

                    # 得到连接
                    linkObj = gameLinksMap[linkKey]
                    linkObj['linkNum'] = linkObj['linkNum'] + 1
                    linkObj['disList'].append(dis)
                    linkObj['quarterInfo'][quarterKey]['disList'].append(dis)
                    linkObj['quarterInfo'][quarterKey]['sXList'].append(sNode['x'])
                    linkObj['quarterInfo'][quarterKey]['sYList'].append(sNode['y'])
                    linkObj['quarterInfo'][quarterKey]['sSList'].append(sNode['s'])
                    linkObj['quarterInfo'][quarterKey]['tXList'].append(tNode['x'])
                    linkObj['quarterInfo'][quarterKey]['tYList'].append(tNode['y'])
                    linkObj['quarterInfo'][quarterKey]['tSList'].append(tNode['s'])
                    linkObj['quarterInfo'][quarterKey]['quarterTimeList'].append(quarterTime)
                    gameLinksMap[linkKey] = linkObj

    gameNodesList, gameLinksList = averageGameInQuartersData(gameNodesMap, gameLinksMap)
    data['data'] = {'nodes': gameNodesList, 'links': gameLinksList}
    return data


def averageGameInQuartersData(gameNodesMap, gameLinksMap):
    gameNodesList = []
    gameLinksList = []
    # 操作节点
    for nodeID in gameNodesMap.keys():
        nodeObj = gameNodesMap[nodeID]
        quarterInfo = nodeObj['quarterInfo']
        quarterList = []
        for quarterKey in quarterInfo.keys():
            quarterObj = quarterInfo[quarterKey]
            if len(quarterObj['xList']) == 0:
                continue
            xList = quarterObj['xList']
            xInfo = getStatisticData(xList)
            yList = quarterObj['yList']
            yInfo = getStatisticData(yList)
            sList = quarterObj['sList']
            sInfo = getStatisticData(sList)
            quarterTimeList = quarterObj['quarterTimeList']
            quarterTimeInfo = getStatisticData(quarterTimeList)
            linkXList = quarterObj['linkXList']
            linkXInfo = getStatisticData(linkXList)
            linkYList = quarterObj['linkYList']
            linkYInfo = getStatisticData(linkYList)
            linkSList = quarterObj['linkSList']
            linkSInfo = getStatisticData(linkSList)
            linkDisList = quarterObj['linkDisList']
            linkDisInfo = getStatisticData(linkDisList)
            linkNum = len(linkDisList)
            linkPlayerIDList = list(set(quarterObj['linkPlayerIDList']))
            linkQuarterTimeList = quarterObj['linkQuarterTimeList']
            linkQuarterTimeInfo = getStatisticData(linkQuarterTimeList)
            # 设置为空
            quarterObj = {}
            # 保存新的数据
            quarterObj['xInfo'] = xInfo
            quarterObj['yInfo'] = yInfo
            quarterObj['sInfo'] = sInfo
            quarterObj['quarterTimeInfo'] = quarterTimeInfo
            quarterObj['linkXInfo'] = linkXInfo
            quarterObj['linkYInfo'] = linkYInfo
            quarterObj['linkSInfo'] = linkSInfo
            quarterObj['linkDisInfo'] = linkDisInfo
            quarterObj['linkNum'] = linkNum
            quarterObj['linkPlayerIDList'] = linkPlayerIDList
            quarterObj['linkQuarterTimeInfo'] = linkQuarterTimeInfo
            quarterObj['timeNum'] = len(quarterTimeList)

            # newRoundObj = {
            #     'roundIndex': quarterObj['quarterIndex'],
            #     'xInfo': xInfo,
            #     'yInfo': yInfo,
            #     'sInfo': sInfo,
            #     'quarterTimeInfo': quarterTimeInfo,
            #     'linkXInfo': linkXInfo,
            #     'linkYInfo': linkYInfo,
            #     'linkSInfo': linkSInfo,
            #     'linkDisInfo': linkDisInfo,
            #     'linkNum': linkNum,
            #     'linkPlayerIDList': linkPlayerIDList,
            #     'linkRoundTimeInfo': linkQuarterTimeInfo
            # }
            quarterList.append(quarterObj)
        nodeObj['quarterInfo'] = quarterList
        gameNodesList.append(nodeObj)
    # 操作 连接
    for linkKey in gameLinksMap.keys():
        linkObj = gameLinksMap[linkKey]
        linkObj['disList'] = getStatisticData(linkObj['disList'])
        # linkObj['disListInfo'] = getStatisticData(linkObj['disList'])
        quarterList = []
        for key in linkObj['quarterInfo'].keys():
            quarterObj = linkObj['quarterInfo'][key]

            if len(quarterObj['disList']) == 0:
                continue
            newRoundObj = {
                'quarterIndex': quarterObj['quarterIndex'],
                'disInfo': getStatisticData(quarterObj['disList']),
                'sXInfo': getStatisticData(quarterObj['sXList']),
                'sYInfo': getStatisticData(quarterObj['sYList']),
                'sSInfo': getStatisticData(quarterObj['sSList']),
                'tXInfo': getStatisticData(quarterObj['tXList']),
                'tYInfo': getStatisticData(quarterObj['tYList']),
                'tSInfo': getStatisticData(quarterObj['tSList']),
                'quarterTimeInfo': getStatisticData(quarterObj['quarterTimeList']),
                'linkNum': len(quarterObj['disList'])
            }
            quarterList.append(newRoundObj)
        linkObj['quarterInfo'] = quarterList
        gameLinksList.append(linkObj)
    return gameNodesList, gameLinksList


# 取得数组的统计值 平均 方差 最小 四分之一 中位 四分之三 最大
def getStatisticData(dataList1):
    result = []
    length = len(dataList1)
    dataList = []
    for d in dataList1:
        dataList.append(d)
    dataList.sort()
    if length <= 0:
        result = [0, 0, 0, 0, 0, 0, 0]
    else:
        # dataList = sorted(dataList)
        aveValue = np.average(dataList)
        # std = np.std(dataList)
        varValue = np.var(dataList)
        result.append(aveValue)
        result.append(varValue)
        result.append(dataList[0])
        result.append(dataList[int(length * 0.25)])
        result.append(dataList[int(length * 0.5)])
        result.append(dataList[int(length * 0.75)])
        result.append(dataList[-1])
    return result


# 得到 时间戳 图 数据
def getTimeStampsGraphList(data):
    # 读取比赛数据
    # data = readGameFile(gameID=gameID)
    gameData = data['data']
    # 设置 序列 存储
    gameList = []
    # 遍历数据
    for quarterIndex in range(len(gameData)):
        quarterData = gameData[quarterIndex]  # 得到 这个小节的 数据
        quarterList = []
        for roundIndex in range(len(quarterData)):
            roundData = quarterData[roundIndex]  # 得到 这个回合 的数据
            roundList = []
            for timeIndex in range(len(roundData)):
                timeData = roundData[timeIndex]  # 得到这个时间点的数据
                quarterTime = timeData[3]  # 小节时间
                roundTime = timeData[4]  # 回合时间
                # 设置真实时间
                timeInfo = (timeData[1]) * 720 - quarterTime
                if quarterIndex > 3:
                    timeInfo = 4 * 720 + (timeData[1] - 4) * 300 - quarterTime
                positionList = timeData[5]  # 球员 位置 序列
                linkList = timeData[6]  # 链接序列
                nodesMap = {}
                for player in positionList:
                    # 构建节点
                    node = {
                        'teamID': player[0],
                        'ID': player[1],
                        'x': player[2],
                        'y': player[3],
                        's': player[5],
                        'sx': player[6],
                        'sy': player[7],
                    }
                    nodesMap[str(player[1])] = node
                linkListTmp = []
                for link in linkList[0]:
                    link = [0] + link
                    linkListTmp.append(link)
                for link in linkList[1][0]:
                    link = [1] + link
                    linkListTmp.append(link)
                for link in linkList[1][1]:
                    link = [2] + link
                    linkListTmp.append(link)
                for link in linkList[2]:
                    link = [3] + link
                    linkListTmp.append(link)
                roundList.append({
                    'timeInfo': round(timeInfo, 3),
                    'quarterIndex': quarterIndex,
                    'quarterTime': quarterTime,
                    'roundIndex': roundIndex,
                    'roundTime': roundTime,
                    'nodes': nodesMap,
                    'links': linkListTmp
                })
            quarterList.append(roundList)
        gameList.append(quarterList)
    data['data'] = gameList

    return data


def saveJsonFile(data, filePath):
    print('一次性写入文件', filePath)
    file = open(filePath, 'a')
    file.write(json.dumps(data) + '\n')
    file.flush()
    file.close()
    print('写入完成')


if __name__ == '__main__':
    # a = [1, 3, 3443, 4545, 65, 2323, 3,34,333,3,3,3,3,3,3,3,3]
    # b = a.sort()
    # b = getStatisticData(a)
    # b = np.average(a)
    gameID = '0021500003'
    # data = readGameFile(gameID)
    data = readTimeGameFile(gameID)
    # data = getRoundGraphList('0021500003')
    # 得到 时间 数据
    # timeStampGraphList = getTimeStampsGraphList(data)
    # saveJsonFile(timeStampGraphList, '/home/cbf/data/basketball/data collection/GameData/timeStamp_' + gameID + '.json')
    # 得到 回合 数据
    # roundGraphData = getRoundGraphListV2(data)
    # roundGraphData = getRoundGraphListV3(data)
    # saveJsonFile(roundGraphData,
    #              '/home/cbf/data/basketball/data collection/GameData/roundWithoutBall_' + gameID + '.json')
    # 得到 小节数据
    # quarterGraphData = getQuarterGraphList(data)
    quarterGraphData = getQuarterGraphListV2(data)
    # saveJsonFile(quarterGraphData, '/home/cbf/data/basketball/data collection/GameData/quarter_' + gameID + '.json')
    saveJsonFile(quarterGraphData, '/home/cbf/data/basketball/data collection/GameData/quarterWithoutBall_' + gameID + '.json')
    # 得到 比赛数据
    # gameGraphData = getGameGraphList(data)
    # saveJsonFile(gameGraphData, '/home/cbf/data/basketball/data collection/GameData/game' + gameID + '.json')
    # a1 = datetime.datetime.now()
    # a = open('/home/cbf/data/basketball/data collection/GameData/round' + gameID + '.json')
    # a = open('/home/cbf/data/basketball/data collection/GameData/quarter' + gameID + '.json')
    # a2 = datetime.datetime.now()
    # b = a.readline()
    # a3 = datetime.datetime.now()
    # c = json.loads(b)
    # a4 = datetime.datetime.now()
    # print(a1, a2, a3, a4)
    # print(a2 - a1, a3 - a2, a4 - a3, a4 - a1)
    # print(1)
