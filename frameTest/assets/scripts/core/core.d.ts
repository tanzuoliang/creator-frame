declare module mh{
	export const enum ViewMode{
		ALONE = 1,
		SHARE
	}
	
	export const enum ViewType{
		UI = 1,
		PANEL = 2,
		ALERT = 3
	}
	
	
	export const enum PLATFORM{
		WX = "wx",
		QQ = "qq",
		TT = "tt"
	}
	
	export class ViewImp{
		registerView(name:string,prefabName:string,scriptName:string,MediatorCLS:class = null,viewType:ViewType = ViewType.PANEL,viewMode:ViewMode = ViewMode.ALONE):void;
		getView(name:string):cc.Node;
		showView(name:string,viewMode:ViewMode = ViewMode.ALONE,viewType:ViewType = ViewType.PANEL):cc.Node;
		removeView(view:cc.Node):void;
		removeAllViews():void;
		removeCertainViewsByFlag(flag:int):void;
	}
	
	export var viewImp : ViewImp;
	
	
	class ClassConfig{
		static create(prefabName:string,scriptName:string,MediatorCLS:class = null):ClassConfig;
	}
	
	class ItemConfig{
		static create(prefabName:string,scriptName:string,width:number,height:number):ItemConfig;
	}
	
	
	class ModuleStack{
		/**
		 * 显示对象 
		 * @param {*} name 注册用到的名字
		 * @param {*} keepPath 是否保存回退路径
		 */
		show(name:string,keepPath:boolen = false):void;
		bakc():cc.Node;
		clean():void;
	}
	
	var moduleStack : ModuleStack;
	
	abstract class BaseScene{
		__sceneName__:string;
		
		start():void;
	}
	
	export function signaletion(cls : class);
	
	class HttpServer{
		/**
		 * 
		 * @param {*} module 请求模块
		 * @param {*} action 请求形为
		 * @param {*} opts   请求参数
		 * @param {*} callfunc 请求成功回调
		 * @param {*} timeoutFunc 超时请求回调
		 */
		static get(module:string,action:string,opts:Object = {},callfunc:Function = null,timeoutFunc:Function = null):void;
		static setRoot(url:string):void;
		static setUid(uid:string):void;
		static setToken(token:string):void;
		/**
		 * 超时时间（默认给的是8秒）
		 */
		static set requestTimeout(v:number);
		/**
		 * 是否示请求loading （默认显示）
		 */
		static set showRequestLoading(b:boolen);
		static setMethod(method:string):void;
		static storeGuestInfo():void;
		static getGuestInfo():void;
		
	} 
	
	class ModelManager{
		static getModel(module:string):BaseModel;
		static seModel(module:string,model:BaseModel):void;
	}
	
	class BaseModel{
		module:string;
		/**
		 * 
		 * @param {*} action 
		 * @param {*} opts 
		 */
		request(action:string,opts:Object = {},event:string = null):void;
		/**
		 * 回调响应 子类重写
		 * @param {*} action 
		 * @param {*} res 
		 * @param {*} event 
		 */
		responseHandler(action:string,res:Object,event:string):void;
		/**
		 * 超时处理
		 * @param {*} action 
		 * @param {*} other 其它数据
		 */
		timeoutHandler(action:string,other : Object):void;
	}
	
	class BaseMediator{
		/**
		 * 订阅事件
		 * @param {*} eventList 事件列表
		 */
		subscribe(eventList:Array):void;
		onMessage(event:string,...param):void;
		/**
		 * 取消订阅
		 */
		unsubscribe():void;
		
		/**
		 * 销毁对象
		 */
		destroy():void;
	}
	
	class BaseComponent{
		registerTouch(node:cc.Node,dis:number = 10):void;
	}
	
	class PlatformConfig{
		loginRes : Function;
		btnUrl : string;
		shareList : Array;
		autoLogin : boolen = true;
		left:number = 100;
		top:number = 100;
		width:number = 100;
		height:number = 100;
		uid:string = "0";
		version:string = "1.0.1";
	}
	
	abstract class BasePlatform{
		initOnShare():void;
		shareGame(shareTicket:string,online:number,title:string,imageUrl:string,query:Object):void;
		callPlatformShare(opts:Object):void;
		shareVideo():void;
		login():void;
		loginPlatformSuccess(res:Object):void;
		loginGameSuccess(res:Object):void;
		rvStart(time:number);
		rvPause();
		rvResume();
		rvStop();
		
	}
	
	class PlatformManager{
		platform : BasePlatform;
		
		init(platformParmas : PlatformConfig,type : PLATFORM = PLATFORM.WX):void;
		shareGame(shareTicket:string,online:number,query:Object,title:string,imageUrl:string):void;
		/**
		 * 分享视频 TT专用
		 */
		shareVideo(shareTicket:string,title:string,videoPath:string,videoTopics=Arrat):void;
		
		/**
		     * 
		     * @param {*} obj   KVDataList	Array.<KVData>		是	要修改的 KV 数据列表
					success	function		否	接口调用成功的回调函数
					fail	function		否	接口调用失败的回调函数
					complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）
		     */
		setUserCloudStorage(obj:object):void;
		
		/**
		 * 
		 * @param {*} score 分数
		 * @param {*} suc 
		 * @param {*} fai 
		 * @param {*} com 
		 */
		setUserScore(score:number,suc:Function = null,fai:Function = null,com:Function = null):void;
		
		setWXOpenId(id:string):void;
		showWXRankList(suc:Function):void;
		hideWXRankList():void;
		/**
		 * 使手机发生较长时间的振动（15 ms)
		 */
		vibrateShort():void;
		/**
		 * 使手机发生较长时间的振动（400 ms)
		 */
		vibrateLong():void;
		
		getQuery():object;
		
		initBanner(adUnitId:string,width:number = 320):void;
		showBanner():void;
		hideBanner():void;
		
		/**
		 * 初始化视频广告
		 * @param {*} adUnitId 广告ID
		 */
		initAwardVedio(adUnitId:string):void;
		showAwardVedio():void;
		/**
		 *是否有视频广告
		 */
		hasVideo():boolen;
		
		rvStart(time:number):void;
		rvPause():void;
		rvResume():void;
		rvStop():void;

		isAndroid():boolen;
	}
	
	abstract class BaseLoading{
		setHost(url:string):void;
		start():void;
		loadResources():void;
		execLoad():void;
		loadAllComplete():void;
		fillPlatformConfig(config:PlatformConfig):void;
		updatePercent(per:number):void;
		//拿到登入数据
		loginResponse(res):void;
	}
	
	export function showToast(title:string,icon:string ="none",duration:number = 2000):void;
	export function showLoading(title:string):void;
	export function hideLoading():void;
	
	
	abstract class BasePanel{
		exitBtn : cc.Button;
	}
	
	abstract class BasePanelMediator{
		
	}
	
	abstract class BaseModule{
		backBtn : cc.Button;
	}
	
	abstract class BaseModuleMediator{
		backModuleName : string;
	}
	
	
	
}