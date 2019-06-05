
const RES = require("./Res");
const http = require("./HTTP");
const {platformManager,PlatformConfig,showToast,setHost,PLATFORM} = require("./PlatformManager"); 
const {ccclass, property} = cc._decorator;
const {BaseComponent} = require("./MVC");
/** eg
cc.Class({
    extends : BaseLaoding,
    properties : {

    },

    onLoad(){
        let devModel = "dev";  //dev  t0  t1
        let is_online = false;
        let HOST = "http://192.168.0.240:9381";
        if(is_online){
            HOST = "https://www.miaohe-game.com/climb"
            //HOST = "https://www.miaohe-game.com/climb"
        }

        let HOST = "http://192.168.0.240:9381";
        if(devModel == "t0"){
            HOST = "https://www.miaohe-game.com/climb"
        }else if(devModel == "t1"){
            HOST = "https://www.kaifu2.com/climb"
        }

        this.setHost(HOST);
        this.nextSceneName = "";
    },

    updatePercent(per){

    },

    //拿到登入数据
    loginResponse(res){

    },

    //填充配置
    fillPlatformConfig(config){
        config.version = "1.0.0";
        config.btnUrl = "res/raw-assets/67/67fba375-efa1-478d-ada7-20c104e2ec32.png"
        config.top = 0.75;//高度百分比
        config.width = 214;//按钮大小，按自己的来
        config.height = 72;
        //默认转发数据
        config.shareList = [{
            title : "疯狂虫子，你能爬多高，等着你来挑战",
            image : "https://public-1258584527.file.myqcloud.com/share/climb/2004.jpg"
        }];
    }    
})
**/

@ccclass
class BaseLoading extends BaseComponent{
    constructor(){
        super();
        this.totalRes = 0;
        this.loadedRes = 0;
        this.nextSceneName = null;
        this.platformFlag = PLATFORM.WX;
    }

    setHost(host){
        http.setRoot(host);
        setHost(host);
    }

    start(){
        if(cc.sys.platform == cc.sys.WECHAT_GAME && this.platformFlag == PLATFORM.WX){

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
        let config  = new PlatformConfig();
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
        cc.director.on(RES.LOADING,this.updatePercent,this);
        cc.director.on(RES.COMPLETE,this.loadAllComplete,this);
        RES.preloadResources(RES.defaultPreloadResources);
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
        cc.director.off(RES.LOADING,this.updatePercent,this);
        cc.director.off(RES.COMPLETE,this.loadAllComplete,this);
    }

//---------------------------------
    fillPlatformConfig(config){}   
    updatePercent(per){}
    loginResponse(res){}
}
module.exports = BaseLoading