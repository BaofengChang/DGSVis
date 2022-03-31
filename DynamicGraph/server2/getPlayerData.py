import json


def getPlayerData(gameID='0021500003'):
    # 读取文件 内 的数据
    # 确定 首发 队员
    file = open('/home/cbf/data/basketball/data collection/GameData/gameGraph/' + gameID + '.json')
    gameData = json.loads(file.readline())
    playerMap = {}
    for player in gameData['homeTeam']['players']:
        playerID = str(player['playerid'])
        player['teamID'] = gameData['homeTeam']['teamid']
        player['teamAbbr'] = gameData['homeTeam']['abbreviation']
        player['teamDes'] = 'home'
        player['isSp'] = 0
        playerMap[playerID] = player
    for player in gameData['visitorTeam']['players']:
        playerID = str(player['playerid'])
        player['teamID'] = gameData['visitorTeam']['teamid']
        player['teamAbbr'] = gameData['visitorTeam']['abbreviation']
        player['teamDes'] = 'visitor'
        player['isSp'] = 0
        playerMap[playerID] = player
    # 确定 首发队员
    for playerPosition in gameData['data'][0][0][0][5]:
        if playerPosition[1] != -1:
            playerID = str(playerPosition[1])
            playerMap[playerID]['isSp'] = 1



    # 连接数量
    file = open('/home/cbf/data/basketball/data collection/GameData/gameGraph/game_' + gameID + '.json')
    gameData = json.loads(file.readline())
    linkList = []
    linkListTemp = gameData['data']['links']
    for link in linkListTemp:
        if link['s'] == -1 or link['t'] == -1:
            continue
        del link['quarterInfo']
        linkList.append(link)


    playerIDList = []
    nodes = gameData['data']['nodes']
    for node in nodes:
        nodeID = node['ID']
        if nodeID != -1:
            playerIDList.append(str(nodeID))

    # 确定 节点
    homePlayerList = []
    visitorPlayerList = []
    for playerID in playerMap.keys():
        if playerID not in playerIDList:
            continue
        if playerMap[playerID]['teamDes'] == 'home':
            homePlayerList.append(playerMap[playerID])
        else:
            visitorPlayerList.append(playerMap[playerID])


    return {'nodes': {'home': homePlayerList, 'visitor': visitorPlayerList},
            'links': linkList}


if __name__ == '__main__':
    getPlayerData()
