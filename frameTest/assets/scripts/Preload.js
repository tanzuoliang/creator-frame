
/**
*   author:ysjwdaypm
*  
**/

require("./core/index");

const {ccclass,property} = cc._decorator;

class NewMediator extends mh.BaseMediator{
    constructor(node){
        super(new MyModel(),node);
        this.subscribe(["test"]);
    }

    onMessage(event,...parmas){
        switch(event){
            case "test":
                console.log(parmas[1] + parmas[2]);
            break;
        }
    }
}

class MyModel extends mh.BaseModel{
    constructor(name){
        super(name);
    }

    buy(...t){
        this.request("skin",{});
    }
}

const ptConfig = {
    wx : {
        dev : "http://192.168.0.240:9381",
        t0 : "https://www.miaohe-game.com/climb",
        t1 : "https://www.kaifu2.com/climb"
    },

    qq : {
        dev : "http://192.168.0.240:9381",
        t0 : "https://www.miaohe-game.com/climbqq",
        t1 : "https://games.miaohe-game.com/climbqq"
    },

    tt : {
        dev : "http://192.168.0.240:9381",
        t0 : "https://www.miaohe-game.com/climbtt",
        t1 : "https://games.miaohe-game.com/climbtt"
    },

    qg : {
        dev : "http://192.168.0.240:9381",
        t0 : "https://www.miaohe-game.com/climbqq",
        t1 : "https://games.miaohe-game.com/climbqq"
    },

    h5 : {
        dev : "http://192.168.0.240:9381",
        t0 : "https://www.miaohe-game.com/climbqq",
        t1 : "https://games.miaohe-game.com/climbqq"
    }
};

const getPtConfig = (type,t) => ptConfig[type][t];

@ccclass
class View extends mh.BaseLoading{

    @property(cc.Label)
    progressLabel = null;

    constructor(){
        super();
        this.platformFlag = mh.PLATFORM.H5;
        this.setHost(getPtConfig(this.platformFlag,"dev"));
        new NewMediator(this);

        mh.res.defaultPreloadResources = [
            {
                "url": "res", 
                "type": 1,
            },
            {
                "url": "prefabs", 
                "type": 4
            },
            {
                "url": "config", 
                "type": 5
            }
        ];
    }

    updatePercent(per){
        if(this.progressLabel){
            this.progressLabel.string = per + "%";
        }
    }

    loadAllComplete(){
        super.loadAllComplete();
        let co = cc.find("Canvas");
        let node = cc.instantiate(mh.res.getItem("testNode",cc.Prefab));
        node.x = -40;
        node.parent = mh.viewImp.uiCOntainer;
        node.zIndex = 2;

        // node.on("test",() => console.log("test info"),this);
        // setTimeout(() => node.emit("test"),1000);
        // // setTimeout(() => node.destroy(),2000);
        // setTimeout(() => node.emit("test"),3000);

        let s = new cc.Node();
        s.addComponent(cc.Sprite);
        if (s) {
            s.parent = mh.viewImp.alertContainer;
            s.zIndex = 1;
            s.color = new cc.Color(255, 255, 0);
            s.getComponent(cc.Sprite).useRemote("https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJMlgrlicZmcoFqd9UEBfxA0Vg3304CsiclHPJG6p66Cw2CmBV9wv9uG5hRx91jItP9tZQZmibEEU3wg/132");

        }

    }

    /**
     * 填充登入数据
     */
    fillPlatformConfig(config){

    }

    loginResponse(res){
        console.log("adadadadada hahaha");
    }

    //update(dt){}

    //onDestroy(){}
}


module.exports = View;