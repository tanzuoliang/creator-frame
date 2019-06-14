
const {ccclass, property} = cc._decorator;
@ccclass
class BaseLoading extends mh.BaseScene{
    constructor(){
        super();
        this.totalRes = 0;
        this.loadedRes = 0;
        this.nextSceneName = null;
        this.platformFlag = mh.PLATFORM.WX;
        this.platformConfig = null;
    }

    setHost(host){
        mh.http.setRoot(host);
        mh.setHost(host);
    }

    isCheckUpdate(){return cc.sys.platform == cc.sys.WECHAT_GAME && this.platformFlag == mh.PLATFORM.WX};

    start(){
        super.start();
        this.platformConfig  = new mh.PlatformConfig();
        this.fillPlatformConfig(this.platformConfig);
        mh.platformManager.init(this.platformConfig,this.platformFlag);    
        if(this.isCheckUpdate()){
            mh.platformManager.updateApp(() => this.loadResources());

        }else{
            this.loadResources();
        }
    }

    loadResources(){
        console.log("----  loadResources -----");
        this.platformConfig.loginRes = (res) => {
            if(res){
                this.platformConfig.shareList = res.data.shares;
                mh.http.setUid(res.data.uid);
                mh.http.setToken(res.data.token);
                mh.http.storeGuestInfo();
            }
            this.loginResponse(res);
            this.execLoad();
        };
        platformManager.run();
    }

//-------------------------------------------- 
    execLoad(){
        console.log("----- exec ----- ");
        cc.director.on(mh.res.LOADING,this.updatePercent,this);
        cc.director.on(mh.res.COMPLETE,this.loadAllComplete,this);
        mh.res.preloadResources(mh.res.defaultPreloadResources);
    }

    loadAllComplete(){
        console.log(`--------- complete ------ ${Date.now()}`);
        this.updatePercent(100);
        cc.game.emit("preloadComplete");
        this.nextSceneName && cc.director.preloadScene(this.nextSceneName,  () => {
            cc.director.loadScene(this.nextSceneName);
        }); 

        cc.director.off(mh.res.LOADING,this.updatePercent,this);
        cc.director.off(mh.res.COMPLETE,this.loadAllComplete,this);
    }

//---------------------------------
    /**
     * 填充登入数据
     */
    fillPlatformConfig(config){}   
    updatePercent(per){}
    loginResponse(res){}
}
module.exports = BaseLoading