import json
import math
import os



def ajaxGraphData(gameID='002150003'):
    # 读取 比赛 数据
    gameFile = open('/home/cbf/data/basketball/data collection/GameData/game' + gameID + '.json')
    gameGraphData = gameFile.readline()
    gameGraphData = json.loads(gameGraphData)
    # 读取 小节 数据

    # 读取 回合 数据

    # 返回数据
    data = {
        'gameGraphData': gameGraphData
    }
    return data


if __name__ == '__main__':
    print(1)