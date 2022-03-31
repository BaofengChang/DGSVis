import math
import os
import json



# 计算生成网络
def generateNetworks(gameData, disThreshold=1.0, kThreshold=1):
    """
    计算生成网络
    :param gameData:  比赛 数据
    :param disThreshold:
    :param kThreshold:
    :return:
    """
    print('生成网络 开始')
    gameID = gameData['gameID']  # 比赛 ID
    gameDate = gameData['gameDate']  # 比赛 日期
    homeTeam = gameData['homeTeam']  # 主队 信息
    visitorTeam = gameData['visitorTeam']  # 客队 信息
    data = gameData['data']  # 比赛数据
    # 遍历 比赛 的 每一个小节
    for periodIndex, period in enumerate(data):
        periodIndex += 1  # 具体是哪一个小节，加1 的意义是从 1 开始
        # 遍历 小节 的 每一个回合
        for roundIndex, round in enumerate(period):
            roundIndex += 1  # 具体是哪一个回合，加1 的意义是从 1 开始
            # 遍历 回合的 每一个时刻
            for timeIndex, timeData in enumerate(round):
                timeIndex += 1  # 具体是哪一个时间，加1 的意义是从 1 开始
                positionList = timeData[5]  # 位置序列
                links = []  # links 先储存所有的 计算到的 links
                # 计算距离
                # 遍历每一个坐标边
                for i in range(len(positionList) - 1):
                    for j in range(i + 1, len(positionList)):
                        p1 = positionList[i]  # 第一个点
                        p2 = positionList[j]  # 第二个点
                        distance = calculateDistance(p1, p2)  # 返回距离
                        link = {'s': p1[1], 't': p2[1], 'dis': distance}  # 建立 连接
                        links.append(link)  # 存储链接
                if len(positionList) > 2:
                    links = filterLinks(positionList, links, disThreshold, kThreshold)  # 筛选链接
                    timeData.append(links)  # 添加 图结构
                else:
                    timeData.append([])
                # print(1)
            # print(1)

        # print(1)
    print('生成网络 结束')
    return gameData


# 使用 阈值 加上 k阈值 筛选链接
def filterLinks(positionList, links, disThreshold=1.0, kThreshold=1):
    """
    筛选链接 使用阈值 加上 k 近邻的计算方法
    阈值 选用 1米 ， k近邻 选择用 1
    :param positionList: 位置序列
    :param links: 所有的链接
    :param disThreshold
    :param kThreshold
    :return: 返回已经筛选好的
    """
    result = []  # 存储结果
    # disThreshold = 1.0
    # kThreshold = 1
    for p in positionList:  # 遍历 平面场上的 位置列表，得到每一个个体的位置信息
        pID = p[1]  # 存储这个个体的ID
        pLinks = []  # 存储这个个体的 所有的链接
        for link in links:  # 筛选由这个节点出发 或者 到这个节点的 link
            if link['s'] == pID or link['t'] == pID:
                pLinks.append(link)  # 存储就这个link
        pLinks = sorted(pLinks, key=lambda k: k['dis'])  # 排序 对 link 进行排序
        linksTmp = []
        for link in pLinks:  # 使用阈值方法 保存网络连接
            if link['dis'] <= disThreshold:
                linksTmp.append(link)
        if len(linksTmp) < kThreshold:  # 使用 k近邻 方法 保存网络连接 这是一个两步走的方法
            linksTmp.append(pLinks[0])

        # 这一步 相当于是 去重，不要重复添加一个值。判断 这个链接 有没有已经存储了 如果已经存储了 那么就不用再存储了
        for link in linksTmp:
            addFlag = True
            for l in result:
                if l['s'] == link['s'] and l['t'] == link['t']:
                    addFlag = False
            if addFlag:
                result.append(link)
    # 返回结果
    return result


# 计算个体 p1 p2 的 距离
def calculateDistance(p1, p2):
    """
    计算两个个体p1 p2 的 在平面上的 欧式距离
    :param p1: 平面上的 个体 p1
    :param p2: 平面上的 个体 p2
    :return: 返回的是距离
    """
    result = 0  # 设立返回结果
    # x1 = p1[2]
    # y1 = p1[3]
    # x1 = p2[2]
    # y1 = p2[3]
    result = math.sqrt((p1[2] - p2[2]) * (p1[2] - p2[2]) + (p1[3] - p2[3]) * (p1[3] - p2[3]))  # 计算 平面 欧式距离
    return 0.3048 * result  # 返回值