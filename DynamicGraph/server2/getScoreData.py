import json
from DynamicGraph.server2.getPlayerData import getPlayerData

# 得到比分数据，其实也有事件数据
def getScoreData(gameID='0021500003'):
    # 读取数据
    file1 = open(
        '/home/cbf/data/basketball/data collection/GameData/eventData/' + gameID + '.json')
    # 转化为json
    scoreData = json.loads(file1.readline())
    eventList = []
    quarterList = []
    # for event in scoreData:
    #     period = event['period']
    #     if len(quarterList) < period:
    #         quarterList.append([])
    #     quarterList[period-1].append(event)


    nodes = getPlayerData(gameID)
    nodes = nodes['nodes']

    # 返回数据
    return {
        'nodes': nodes,
        'gameID': gameID,
        'data': scoreData,
        'dataDes': "比赛 的 得分和事件数据"
    }


if __name__ == '__main__':
    print(1)
    getScoreData()