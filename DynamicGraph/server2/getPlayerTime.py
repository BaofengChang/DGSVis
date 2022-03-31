import json
def getPlayerTimeByID(gameID='0021500003', playerID='2570'):
    # 读取数据
    file = open('/home/cbf/data/basketball/data collection/GameData/playerDataLinkDataTimeData/player_'+gameID+'.json')
    data = json.loads(file.readline())
    playerData = data[playerID]
    timeDataList = playerData['data']
    # 存储数据
    timeList = []
    # 查找数据
    for timeData in timeDataList:
        timeIndex = timeData[0:6]
        timeList.append(timeIndex)
    # 返回数据
    return timeList


def getLinkTimeByID(gameID='0021500003', sid='2570', tid='2738'):
    # 读取数据
    file = open(
        '/home/cbf/data/basketball/data collection/GameData/playerDataLinkDataTimeData/link_' + gameID + '.json')
    data = json.loads(file.readline())
    # 设置连接的key
    linkKey = sid + 'to' + tid
    # 存储链接时间
    linkTimeList = []
    # 得到 连接 对于 时间的 索引
    linkTimeIndexMap = data['timeIndexMap']
    linkTimeIndexList = linkTimeIndexMap[linkKey]
    # 得到 连接 出现 的时间
    timeList = data['timeList']
    for timeIndex in linkTimeIndexList:
        timeData = timeList[timeIndex]
        linkTimeList.append(timeData[0:6])
    # 返回值
    return linkTimeList


def getPlayerRoundByID(gameID='0021500003', playerID='2570'):
    # 读取数据
    file = open(
        '/home/cbf/data/basketball/data collection/GameData/playerDataLinkDataTimeData/player_' + gameID + '.json')
    data = json.loads(file.readline())
    playerData = data[playerID]
    timeDataList = playerData['data']
    # 存储数据
    # roundList = []
    roundKeyList = []
    # 查找数据
    for timeData in timeDataList:
        timeIndex = timeData[0:6]
        roundKey = 'r-' + str(timeIndex[1]) + '-' + str(timeIndex[3])
        if roundKey not in roundKeyList:
            roundKeyList.append(roundKey)
        # roundList.append(timeIndex)
    # 返回数据
    return roundKeyList


if __name__ == '__main__':
    # 测试 取得 球员 时间
    # getPlayerTimeByID()
    # 测试 取得 link 时间
    # getLinkTimeByID()
    # 测试 取得 round 时间
    getPlayerRoundByID()
