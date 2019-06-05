
/**
*   author:ysjwdaypm
*  
**/

const config = {
    wx : {
        dev : "192.168.0.240:9381",
        t0 : "https://www.miaohe-game.com/climb",
        t1 : "https://www.kaifu2.com/climb"
    },

    qq : {
        dev : "192.168.0.240:9381",
        t0 : "https://www.miaohe-game.com/climbqq",
        t1 : "https://games.miaohe-game.com/climbqq"
    },

    tt : {
        dev : "192.168.0.240:9381",
        t0 : "https://www.miaohe-game.com/climbtt",
        t1 : "https://games.miaohe-game.com/climbtt"
    }
};

module.exports = (type,t) => config[type][t];