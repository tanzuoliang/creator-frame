const isWX = cc.sys.platform == cc.sys.WECHAT_GAME;
const showLoading = title => {
    if(isWX){
        wx.showLoading({title,mask:true});
    }
};

const hideLoading = () => {
    if(isWX){
        wx.hideLoading();
    }
};


const showToast = (title,icon = "none",duration = 2000) => {
    if(isWX){
        wx.showToast({title,icon,duration});
    }
};

window.isWX = isWX;
window.notify = {showLoading,hideLoading,showToast};//兼容老版本
window.mh_notify = {showLoading,hideLoading,showToast};

//------------------------------------------------
class BasePlatform{
    constructor(parmas){
        this.platformParmas = parmas;

        this.initOnShare();

        this.__openid__ = cc.sys.localStorage.getItem("platform_openid");
        //--------------------------
        this.platformParmas.autoLogin ? this.login() : this.loginGameSuccess();
        this.onShareTime = 0;
        this.shareMode = false;
        this.shareTicket = "";

    }

    set openid(v){
        cc.sys.localStorage.setItem("platform_openid",v);
    }

    shareGame(shareTicket,online,title,imageUrl,query){
        this.shareTicket = shareTicket;
        if(online == 0){
            cc.director.emit("sharePass",123456789,this.shareTicket);
            return;
        }
        if(!title){
            let index = Math.floor(Math.random() * this.platformParmas.shareList.length);
            let data = this.platformParmas.shareList[index];
            title = data.title;
            imageUrl = data.image;
            // query = "uid="+this.platformParmas.uid;
            query = query ||"uid="+this.platformParmas.uid;
        }
        let ald_desc = "award";
        this.callPlatformShare({title,imageUrl,query,ald_desc});
        // wx.shareAppMessage({title,imageUrl,query});
        this.onShareTime = Date.now();
        this.shareMode = true;
    }

    callPlatformShare(opts){}
    initOnShare(){}

    shareVideo(){};

    login(){
        showLoading("正在检测帐号");
        wx.login({
            success : res => {
                this.loginPlatformSuccess(res);
            },

            fail : err => {
                setTimeout(() => this.login(),1000);
            }
        });
    }

    loginPlatformSuccess(res){};

    loginGameSuccess(res = null){
        hideLoading();
        this.platformParmas.loginRes && this.platformParmas.loginRes(res);
    }


    rvStart(time){}
    rvPause(){}
    rvResume(){}
    rvStop(){}
}
//------------------------------------------------

class TTPlatform extends BasePlatform{
    /**
     * 
     * @param {*} parmas
     */
    constructor(parmas){
        super(parmas);
        this.recorder = tt.getGameRecorderManager();
        this.registerRVEvent();
        this.tempVideoPath = null;
        this.startRVTime = 0;
        this.startInterruptTime = 0;
        this.totalInterruptTime = 0;

        this.onRVIng = false;

    }

    initOnShare(){
        wx.showShareMenu({
            withShareTicket : true, fail : res => console.log(`open share menu fail ${JSON.stringify(res)}`)
        });

        // wx.onShareAppMessage( () => {
        wx.aldOnShareAppMessage( () => {
            let index = Math.floor(Math.random() * this.platformParmas.shareList.length);
            let data = this.platformParmas.shareList[index];
            return {
                title : data.title,
                imageUrl : data.image,
                query : "uid="+this.platformParmas.uid,
                success : () => cc.director.emit("sharePass",1234567),
                fail : () => cc.director.emit("sharePass",1)
            };
        });

    }

    getStore(){
        let storeInfo = cc.sys.localStorage.getItem(this.saveKey);
        if(storeInfo){
            storeInfo = JSON.parse(storeInfo);
            this.code = storeInfo.code;
            this.anonymousCode = storeInfo.anonymousCode;
        }else{
            this.code = null;
            this.anonymousCode = null;
        }
    }

    setStore(){
        cc.sys.localStorage.setItem(this.saveKey,JSON.stringify({
            code : this.code,
            anonymousCode : this.anonymousCode
        }));
    }

    login(){
        this.saveKey = "ttTokenInfo";
        this.getStore();
        tt.checkSession({
            success : res => {
                console.log(`session未过期 : ${JSON.stringify(res)} __openid__ = ${this.__openid__}`);
                this.__openid__ ? this.loginPlatformSuccess({
                    code : this.code,
                    anonymousCode : this.anonymousCode,
                    openid : this.__openid__
                }) : this.loginTT();
            },
            fail : res => {
                console.log(`session已过期，需要重新登录`);
                this.loginTT();
            }
        });
    }


    loginTT(){
        showLoading("检测帐号");
        wx.login({
            force : false,
            success : res => {
                this.loginPlatformSuccess(res,true);
            },

            fail : err => {
                setTimeout(() => this.loginTT(),1000);
            }
        });
    }

    
    loginPlatformSuccess(res,isNew = false){
        if(isNew){
            this.code = res.code;
            this.anonymousCode = res.anonymousCode;
            this.setStore();
        }

        wx.request({
            url: connect_host,
            method: "GET",
            data: {
                m : "Login",
                a : "login",
                code: this.code,
                anonymousCode : this.anonymousCode,
                version : this.platformParmas.version,
                openid : res.openid || "",
                "platform" : "tt"
            },
            success: res => this.loginGameSuccess(res.data),
            fail : err => {
                // console.log(err)
                setTimeout(() => this.loginPlatformSuccess(res),200);
            }
        });
    }

    shareVideo(shareTicket,title,videoPath,videoTopics=['']){
        videoPath = videoPath || this.tempVideoPath;
        if(videoPath){
            wx.shareAppMessage({
                channel : "video",
                title,
                extra : {
                    videoPath,
                    videoTopics
                },
                query : "uid="+this.platformParmas.uid,
                success : () => cc.director.emit("sharePass",1234567,shareTicket),
                fail : () => cc.director.emit("sharePass",1,shareTicket)
            });
        }
    }

    callPlatformShare(opts){
        opts.success = () => cc.director.emit("sharePass",1234567,this.shareTicket),
        opts.fail = () => cc.director.emit("sharePass",1,this.shareTicket);
        wx.aldShareAppMessage(opts);
    }

    rvStart(duration=12){
        if(!this.onRVIng){
            this.tempVideoPath = null;
            this.startRVTime = Date.now();
            this.startInterruptTime = 0;
            this.totalInterruptTime = 0;
            this.recorder && this.recorder.start({duration});

            this.onRVIng = true;
        }
    }

    rvPause(){
        this.recorder && this.onRVIng && this.recorder.pause();
    }

    rvResume(){
        this.recorder && this.onRVIng && this.recorder.resume();
    }

    rvStop(){
        if(this.onRVIng){
            this.recorder && this.recorder.stop();
        }
        
    }

    registerRVEvent(){
        if(this.recorder){
            this.recorder.onStop(res => {
                if(this.onRVIng){
                    let nowTime = Date.now();
                    let passTime = nowTime - this.startRVTime - this.totalInterruptTime;
                    this.tempVideoPath = res.videoPath;
                    console.log(res.videoPath);

                    this.onRVIng = false;
                }
    
            });

            this.recorder.onError(res => console.log(JSON.stringify(res)));
            this.recorder.onInterruptionBegin(() => {
                this.startInterruptTime = Date.now();
            });

            this.recorder.onInterruptionEnd(() => {
                this.totalInterruptTime = Date.now() - this.startInterruptTime;
            });
        }
    }
}

//--------------------------------------------------------
class WXPlatform extends BasePlatform{
    /**
     * 
     * @param {*} parmas
     */
    constructor(parmas){
        super(parmas);
        this.wxCode = null;
        
    }

    initOnShare(){
        wx.showShareMenu({
            withShareTicket : true, fail : res => console.log(`open share menu fail ${JSON.stringify(res)}`)
        });

        // wx.onShareAppMessage( () => {
        wx.aldOnShareAppMessage( () => {
            let index = Math.floor(Math.random() * this.platformParmas.shareList.length);
            let data = this.platformParmas.shareList[index];
            return {
                title : data.title,
                imageUrl : data.image,
                query : "uid="+this.platformParmas.uid
            };
        });

        wx.onShow(() => {
            cc.log("onShow" + this.shareMode);
            if(this.shareMode){
                this.shareMode = false;
                let now = Date.now();
                let pass = now - this.onShareTime;
                cc.director.emit("sharePass",pass,this.shareTicket);
            }
        });
    }
    
    loginPlatformSuccess(res){
        this.wxCode = res.code;
        this.showQueryUserInfoButton();
    }
    
    showQueryUserInfoButton(){
        hideLoading();

        const {screenWidth,screenHeight} = wx.getSystemInfoSync();
        let left = (screenWidth - this.platformParmas.width) * 0.5;
        let btn = wx.createUserInfoButton({
            type : "image",
            image : this.platformParmas.btnUrl,
            style : {
                left,
                top : this.platformParmas.top * screenHeight,
                width  :this.platformParmas.width,
                height : this.platformParmas.height,
            }
        });

        btn.onTap( res => {

            showLoading("正在登入游戏");
            btn.hide();
            if(res.errMsg == "getUserInfo:ok"){
                this.loginGameWithUserInfo(res);
            }else{
                this.loginGameWithGuest();
            }
        });
    }

    loginGameWithUserInfo(res){
    
        wx.request({
            url: connect_host,
            method: "GET",
            data: {
                m : "Login",
                a : "login",
                code: this.wxCode,
                iv: res.iv,
                signature : res.signature,
                encryptedData: res.encryptedData,//到时候这个就不要了
                rawData : res.rawData,
                version : this.platformParmas.version,
                "platform" : "wx"
            },
            success: res => this.loginGameSuccess(res.data),
            fail : err => {
                // console.log(err)
                setTimeout(() => this.loginGameWithUserInfo(res),200);
            }
        });
        
        // this.loginGameSuccess(res);
    }

    loginGameWithGuest(){
        wx.request({
                url: connect_host,
                method: "GET",
                data: {
                m : "Login",
                a : "wxguest",
                code: this.wxCode,
                version : this.platformParmas.version,
                "platform" : "wx"
            },
            success: res => this.loginGameSuccess(res.data),
            fail : err => {
                setTimeout(() => this.loginGameWithGuest(),200);
            }
        });
        // this.loginGameSuccess();
    }

    callPlatformShare(opts){
        wx.aldShareAppMessage(opts);
    }

}

const PLATFORM = cc.Enum({
    WX : "wx",
    QQ : "qq",
    TT : "tt"
});

function getPlatformManager(type,platformParmas){
    switch(type){
        case PLATFORM.WX:
        case PLATFORM.QQ:
            return new WXPlatform(platformParmas);
        break;

        case PLATFORM.TT:
            return new TTPlatform(platformParmas);
        break;

        default:
            return new WXPlatform(platformParmas);
        break;
    }
}


class RewardVedio{
    constructor(adUnitId){

        this.videoLoaded = false;
        this.adUnitId = adUnitId;
        this.video = null;
        // showLoading("努力加载中......");
    }


    build(){
        this.video = wx.createRewardedVideoAd({adUnitId : this.adUnitId});
        this.video.onClose(res => {
            this.videoLoaded = false;
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                cc.game.emit("video:complete");
            } else {
                // 播放中途退出，不下发游戏奖励
                cc.game.emit("video:skip");
            }
        });

        this.video.onLoad( () => {
            this.videoLoaded = true;
            console.log(`广告准备成功`);
        });

        this.video.onError (err => {
            this.videoLoaded = false;
            if(err.errCode == 1004){
                cc.game.emit("video:complete");
            }else{
                cc.game.emit("video:skip");
            }
            console.log(`------ system load video fail : ${JSON.stringify(err)}`);
        });
    }

    showVideo(){
        !this.video && this.build();
        this.video.show().then( () => console.log(`------ show video success ------`))
            .catch( err => {
                console.log(`---- show video fail ${err ? JSON.stringify(err) : ""}`);
                this.video.load().then( () => this.video.show()).catch(() => {
                    cc.game.emit("video:finish");
                });
        });
    }
}

class BannerAd{

    /**
     * 
     * @param {*} config {adUnitId : string,style : {left,top,width,height} }
     */
    constructor(adUnitId,bannerWidth){
        this.banner = null;
        this.hasBanner = false;
        this.adUnitId = adUnitId;
        this.bannerWidth = bannerWidth;
        // this.newAd(this.adUnitId,this.bannerWidth);

        this.onResizeHandler = res => {
            if(this.banner){
                const {screenWidth,screenHeight} = wx.getSystemInfoSync();
                this.banner.style.left = (screenWidth - res.width) * 0.5;
                this.banner.style.top = screenHeight - res.height - 5;
                console.log("RealSize = ",res);
            }
        }

        this.onErrorHanlder = err => {
            console.log(`------ get banner fail with ${JSON.stringify(err)}`);
        };
    }

    newAd(adUnitId,width){
        this.adUnitId = adUnitId;
        this.hideAd();
        const {screenWidth,screenHeight} = wx.getSystemInfoSync();
        const left = (screenWidth - width) * 0.5
        const top = screenHeight - 110;
        let style = {left,top,width};
        this.banner = wx.createBannerAd({adUnitId,style});

        this.banner.onResize(this.onResizeHandler);
        this.banner.onError(this.onErrorHanlder);
    }

    showAd(){
        this.newAd(this.adUnitId,this.bannerWidth);
        this.banner && this.banner.show().then( () => console.log(`----- banner show success ------`))
                            .catch(() => console.log(`----- banner show fail -------`));
    }

    hideAd(){
        if(this.banner){
            this.banner.offResize(this.onResizeHandler);
            this.banner.offResize(this.onErrorHanlder);
            this.banner.hide();
            this.banner.destroy();
            this.banner = null;
        } 
        // this.newAd(this.adUnitId,this.bannerWidth);
    }
}


class PlatformConfig{
    constructor(){
        this.loginRes = () => {console.log("----- execute default login callback -------")};
        this.btnUrl = "res/btn_normal.png";
        this.shareList = [{title : "test",image : "default"}];
        this.autoLogin = true;
        this.left = 100;
        this.top = 100;
        this.width = 100;
        this.height = 30;
        this.uid = 0;
        this.version = "1.0.0";
    }
}

class PlatformManager{
    constructor(){
        this.platform = null;
        this.banner = null;
        this.video = null;
        this.type = null;
    }

    /**
     * 
     * @param {*} platformParmas {loginRes : function , btnUrl : string, shareImgUrl : string,autoLogin : Boolean,
     *  left:number,top:number}
     */
    init(platformParmas,type = PLATFORM.WX){
        this.type = type;
        if(isWX){
            // this.platform = new WXPlatform(platformParmas);
            require("./../ald/ald-game")();
            this.platform = getPlatformManager(type,platformParmas);
        }else{
            //目前用来游戏客（也就是非平台）
            if(platformParmas.loginRes){
                // let http = require("./HTTP");
                // http.getGuestInfo();
                // http.get("Login","guest",res => platformParmas.loginRes(res));

                platformParmas.loginRes(null);
            }
        }
    }

    /**
     * 
     * @param {*} shareTicket 
     * @param {*} title 
     * @param {*} query 
     * @param {*} imageUrl 
     */
    shareGame(shareTicket,online,query,title,imageUrl){
        this.platform && this.platform.shareGame(shareTicket,online,title,imageUrl,query);
    }

    /**
     * 分享视频 TT专用
     */
    shareVideo(shareTicket,title,videoPath,videoTopics=['']){
        this.platform && this.platform.shareVideo(shareTicket,title,videoPath,videoTopics);
    }

    /**
     * 
     * @param {*} obj   KVDataList	Array.<KVData>		是	要修改的 KV 数据列表
                        success	function		否	接口调用成功的回调函数
                        fail	function		否	接口调用失败的回调函数
                        complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）
     */
    setUserCloudStorage(obj){
        isWX && wx.setUserCloudStorage(obj);
    }

    /**
     * 
     * @param {*} score 分数
     * @param {*} suc 
     * @param {*} fai 
     * @param {*} com 
     */
    setUserScore(score,suc = null,fai = null,com = null){
        if(isWX){
            wx.getOpenDataContext().postMessage({type : "storeScore",score : score});
        }
        setTimeout(suc,2000);
    }

    setWXOpenId(id){
        if(isWX){
            wx.getOpenDataContext().postMessage({type : "setOpenId",openid : id});
            this.platform.openid = id;
        }
    }

    /**
     * 显示微信排行榜
     */
    showWXRankList(suc){
        if(isWX){
            wx.getOpenDataContext().postMessage({type : "showRank"});
        }
        suc && suc();
    }

    hideWXRankList(){
        if(isWX){
            wx.getOpenDataContext().postMessage({type : "hideRank"});
        }
    }

    vibrateShort(){
        isWX && wx.vibrateShort();
    }

    /**
     * 使手机发生较长时间的振动（400 ms)
     */
    vibrateLong(){
        isWX && wx.vibrateLong();
    }

    getQuery(){
        if(isWX){
            return wx.getLaunchOptionsSync().query
        }

        return {};
    }
//----------------------------- 关于广告 --------------------------
    /**
     * 显示banner广告
     * @param {*} adUnitId banner 广告ID
     * @param {*} left 
     * @param {*} top 
     * @param {*} width 
     */
    initBanner(adUnitId,width = 320){
        if(isWX){
            this.banner = new BannerAd(adUnitId,width);
        }
    }    


    showBanner(){
        this.banner && this.banner.showAd();
    }   
    /**
     * 隐藏banner广告
     */
    hideBanner(){
        if(this.banner){
            this.banner.hideAd();
        }
    }


    /**
     * 显示视频广告
     */
    showAwardVedio(adUnitId){
        this.video && this.video.showVideo();
    }

    /**
     * 初始化视频广告
     * @param {*} adUnitId 广告ID
     */
    initAwardVedio(adUnitId){
        if(isWX){
            this.video = new RewardVedio(adUnitId);
        }
    }

    /**
     *是否有视频广告
     */
    hasVideo(){
        return this.video && this.video.videoLoaded;
    }

    rvStart(time){
        this.platform && this.platform.rvStart(time);
    }
    rvPause(){this.platform && this.platform.rvPause();}
    rvResume(){this.platform && this.platform.rvResume();}
    rvStop(){this.platform && this.platform.rvStop();}

    isAndroid(){
        return isWX && wx.getSystemInfoSync().system.split(" ")[0] == "Android";
    }
}

const platformManager = window.platformManager  = new PlatformManager();


let connect_host = "";
function setHost(url){
    connect_host = url;
}

module.exports = {
    PLATFORM,
    platformManager,
    PlatformConfig,
    setHost,
    showToast,
    showLoading,
    hideLoading
}