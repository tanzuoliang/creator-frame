

const {ccclass, property} = cc._decorator;
require("./../index");
@ccclass
class BaseLoading extends mh.BaseScene{
    constructor(){
        super();
        this.totalRes = 0;
        this.loadedRes = 0;
        this.nextSceneName = null;
        this.platformFlag = mh.PLATFORM.WX;
    }

    setHost(host){
        mh.http.setRoot(host);
        mh.setHost(host);
    }

    isCheckUpdate(){return cc.sys.platform == cc.sys.WECHAT_GAME && this.platformFlag == mh.PLATFORM.WX};

    start(){
        super.start();
        if(this.isCheckUpdate()){

            const updateManager = wx.getUpdateManager();
            updateManager.onCheckForUpdate( res => {
                // 请求完新版本信息的回调
                showToast(res.hasUpdate ? "有新版本" : "当前还没有新版本");
                if(!res.hasUpdate){
                    this.loadResources();
                }
            });

            updateManager.onUpdateReady( () => {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate();
            });
            
            updateManager.onUpdateFailed(() => {
            // 新的版本下载失败
                showToast('新版本下载失败');
                this.loadResources();
            });
        }else{
            this.loadResources();
        }
    }

    loadResources(){
        let config  = new mh.PlatformConfig();
        this.fillPlatformConfig(config);
        config.loginRes = (res) => {
            config.shareList = res.data.shares;
            http.setUid(res.data.uid);
            http.setToken(res.data.token);
            http.storeGuestInfo();
            this.loginResponse(res);
            this.execLoad();
        };
        platformManager.init(config,this.platformFlag);
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
    }

    onDestroy(){
        super.onDestroy();
        cc.director.off(mh.res.LOADING,this.updatePercent,this);
        cc.director.off(mh.res.COMPLETE,this.loadAllComplete,this);
    }

//---------------------------------
    fillPlatformConfig(config){}   
    updatePercent(per){}
    loginResponse(res){}
}
module.exports = BaseLoading