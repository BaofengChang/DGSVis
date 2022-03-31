import json


def getRoundData(gameID='0021500003'):
    # 读取 数据
    file = open(
        '/home/cbf/data/basketball/data collection/GameData/playerDataLinkDataTimeData/RoundDivided_' + gameID + '.json')
    gameData = json.loads(file.readline())
    # 得到 小节 列表
    # quarterList = gameData['data']
    # 统计每一个回合的节点 和 每一个回合的链接

    return gameData


if __name__ == '__main__':

    gameData = getRoundData()
    quarterList = gameData['data']
    for quarterIndex in range(len(quarterList)):
        for roundIndex in range(len(quarterList[quarterIndex])):
            roundData = quarterList[quarterIndex][roundIndex]
            a = roundData['startQuarterTime']
            b = roundData['endQuarterTime']
            print(quarterIndex, '\t', roundIndex,'\t', int(a / 60), '-', int(a % 60), '\t',int(b / 60), '-', int(b % 60))
    # getRoundData()
