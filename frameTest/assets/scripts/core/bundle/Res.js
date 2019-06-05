
/**
 * var AssetTable = require('./asset-table');
 * var resources = new AssetTable();
 * resources.getUuidArray(url, type, urls);
 * let out = [];
            cc.loader._resources.getUuidArray("res", cc.SpriteFrame, out);
            console.log(out);     
 */


/**
 * 资源类型
 */
const RESOURCE_TYPE = cc.Enum({
    SPRITE_FRAME : 1,
    SPRITE_ATLAS : 2,
    TEXTURE      : 3,
    PREFAB       : 4,
    CONFIG       : 5,
    AUDIO        : 6
});

const RES_TYPE_TO_ASSET_TYPE = [null,cc.SpriteFrame,cc.SpriteAtlas,cc.TEXTURE,cc.Prefab,cc.JsonAsset,cc.AudioClip];

class BaseStore{
    constructor(name = "default"){
        this.__map__ = {};
        this.__name__ = name;
    }
    getItem(baseName){return this.__map__[baseName];}
    setItem(baseName,resource){ this.__map__[baseName] = resource;}
    deleteItem(baseName){return delete this.__map__[baseName];}
}

BaseStore.create = name => new BaseStore(name);

class ConfigStore extends BaseStore{
    constructor(name = "default"){
        super(name);
    }

    setItem(baseName,resource){ this.__map__[baseName] = resource.json;}
}

ConfigStore.create = name => new ConfigStore(name);

class __R__{
    constructor(){
        this._frameMap = BaseStore.create("frames");
        this._atlasMap = BaseStore.create("atlas");
        this._prefabMap = BaseStore.create("prefabs");
        this._audioMap =BaseStore.create("audio");
        this._configMap = ConfigStore.create("config");
        this._dragonbones= BaseStore.create("dragon")
        this.loadResources = [];
        this.loadedPercent = 0;

        this.errorResourceList = [];
        this.resourceSizeMap = {};
        this.resourcePercentMap = {};

        this.reloadCount = 0;
        this.__defaultPreloadResources__ = [];

        /**
         * 正在加载的对象
         */
        this.__cacheLoadingMap__ = {};
    }

    set defaultPreloadResources(value){
        this.__defaultPreloadResources__ = value;
    }

    get defaultPreloadResources(){return this.__defaultPreloadResources__;}
//---------------------------------------    

    onProgress(loadItem,completedCount,totalCount){
        if(totalCount == 0)return;
        let rate = this.resourcePercentMap[loadItem.flag];
        let per = this.loadedPercent + rate * completedCount / totalCount; 
        cc.director.emit(this.LOADING, Math.min(100,Math.floor(per * 100)) );
    }
//---------------------------------------------------------------
    errorHandle(loadItem,assetType,loadList){
        let errorList = [];
        let out = this.resourceSizeMap[loadItem.flag];
        out.forEach( url => {
            !loadList.includes(url) && !errorList.includes(url) &&  errorList.push(url);
        });
        //
        console.log(`------- load error ${loadItem.flag}  list:${JSON.stringify(errorList)}`);
        this.errorResourceList.push(loadItem);
    }

    reloadErrorUrls(){
        for(let dir in this.errorMap){
            let errorItem = this.errorMap[dir];
            let list = errorItem.errorList;
            let type = errorItem.type;
            cc.loader.loadResArray(list,type,(error,resource) => {

            });
        }
    }


//--------------------------------------------------------------
    preloadItem(){
        let loadItem = this.loadResources[this.loadedIndex];
        this.preloadDir(loadItem);
    }

    /**
     * 加载单个文件夹
     * @param {*} loadItem 
     */
    preloadDir(loadItem){
        switch(loadItem.type){
            case RESOURCE_TYPE.SPRITE_FRAME:
                cc.loader.loadResDir(loadItem.url,cc.SpriteFrame,this.onProgress.bind(this,loadItem),(erros,resource,urls) => {
                    if(erros){
                        this.errorHandle(loadItem,cc.SpriteFrame,urls);
                    }
                    this.saveResource(resource,urls,this._frameMap,loadItem)
                });
            break;

            case RESOURCE_TYPE.SPRITE_ATLAS:
                cc.loader.loadResDir(loadItem.url,cc.SpriteAtlas,this.onProgress.bind(this,loadItem),(erros,resource,urls) => {
                    if(erros){
                        this.errorHandle(loadItem,cc.SpriteAtlas,urls);
                    }
                    this.saveResource(resource,urls,this._atlasMap,loadItem);
                });
            break;

            case RESOURCE_TYPE.PREFAB:
                cc.loader.loadResDir(loadItem.url,cc.Prefab,this.onProgress.bind(this,loadItem),(erros,resource,urls) => {
                    if(erros){
                        this.errorHandle(loadItem,cc.Prefab,urls);
                    }
                    this.saveResource(resource,urls,this._prefabMap,loadItem);
                });
            break;

            case RESOURCE_TYPE.CONFIG:
                cc.loader.loadResDir(loadItem.url,cc.JsonAsset,this.onProgress.bind(this,loadItem),(erros,resource,urls) => {
                    if(erros){
                        this.errorHandle(loadItem,cc.JsonAsset,urls);
                    }
                    this.saveResource(resource,urls,this._configMap,loadItem);
                });
            break;

            case RESOURCE_TYPE.AUDIO:
                cc.loader.loadResDir(loadItem.url, cc.AudioClip ,this.onProgress.bind(this,loadItem),(erros,resource,urls) => {
                    if(erros){
                        this.errorHandle(loadItem,cc.AudioClip,urls);
                    }
                    this.saveResource(resource,urls,this._audioMap,loadItem);
                });
            break;
        }
    }

    /**
     * 保存本地
     */
    saveResource(resource,urls,storeItem,loadItem){
        for(let i = 0,len = urls.length;i < len;i++){
            let url = urls[i];
            let baseResName = url.split("/").pop();
            // console.log(`baseName = ${baseResName}`);
            storeItem.setItem(baseResName,resource[i]);
        }
        this.preloadItemComplete(loadItem);
    }

    /**
     * 预加载基础资源
     * @param {*} resources [{url,type : [1,2,3]}]
     */
    preloadResources(resources){
        if(!(resources instanceof Array)){
            resources = [resources];
        }
        this.loadResources = resources;

        let totalSize = 0;
        resources.forEach(loadItem => {
            let out = [];
            let flag = loadItem.flag || loadItem.url + ":" + loadItem.type;
            cc.loader._resources.getUuidArray(loadItem.url, RES_TYPE_TO_ASSET_TYPE[loadItem.type], out);
            this.resourceSizeMap[flag] = out; 
            totalSize += out.length;
            loadItem.flag = flag;
        });

        for(let key in this.resourceSizeMap){
            this.resourcePercentMap[key] = this.resourceSizeMap[key].length / totalSize;
        }

        this.loadedIndex = 0;
        for(let i = 0; i < 1;i++){
            this.preloadItem();
        }
    }

    /**
     * 加载单个资源 {url,type : [1,2,3]}
     */
    preloadItemComplete(loadItem){
        this.loadedIndex++;
        this.loadedPercent += this.resourcePercentMap[loadItem.flag];
        if(this.loadedIndex < this.loadResources.length){
            // this.loadedPercent += this.resourcePercentMap[loadItem.flag];
            this.preloadItem();
        }else{
            if(this.errorResourceList.length > 0){
                this.reloadCount++;//重连次数
                console.log("------ load missing resource " +  this.reloadCount + " again -------" 
                + JSON.stringify(this.errorResourceList));
                this.resourceSizeMap = {};
                this.preloadResources(this.errorResourceList);
                this.errorResourceList.length = 0;
            }   
            else{
                cc.director.emit(this.COMPLETE);
            }
        }
    }

    /**
     * 删除预加载资源（进游戏加载的）
     * @param {*} resources [{url,type : [1,2,3]}]
     */
    unload(resources){
        resources = resources || this.loadResources;
        resources.forEach(loadItem => {
            cc.loader.releaseResDir(loadItem.url);
            let type = RES_TYPE_TO_ASSET_TYPE[loadItem.type];
            let out = [];
            cc.loader._resources.getUuidArray(loadItem.url, RES_TYPE_TO_ASSET_TYPE[loadItem.type], out);

            let store = this.getStore(type);
            store && out.forEach(res => {
                let baseResName = res.split("/").pop();
                store.deleteItem(baseResName);
            });
        });

    }
//------------------------- module resource load -------
    /**
     * 加载模块需要资源
     * @param {*} resources [{url,type:[cc.SpriteFrame]}]
     */
    preloadModuleResource(resources){
        MODULE.load(resources);
    }
    /**
     * 删除模块资源
     */
    unloadModuleResource(){
        MODULE.unload();
    }

//---------------------------------------------------
    /**
     * 获取存储对象 
     */
    getStore(assetType){
        let result = null;
        switch(assetType){
            case cc.SpriteFrame:
                result = this._frameMap;
            break;

            case cc.SpriteAtlas:
                result = this._atlasMap;
            break;

            case cc.JsonAsset:
                result = this._configMap;
            break;

            case cc.Prefab:
                result = this._prefabMap;
            break;

            case cc.AudioClip:
                result = this._audioMap;
            break;

            case dragonBones.DragonBonesAsset:
                result = this._dragonbones;
            break;
        }
        return result;
    }

    /**
     * 获取资源
     * @param {*} url 资源路径
     * @param {*} assetType 资源类型
     */
    getItem(url,assetType){
        let store = this.getStore(assetType);
        let baseResName = url.split("/").pop();
        return store ? store.getItem(baseResName) : null;
    }
//-----------------------------------------------------------------
    ___loadSignalItem___(url,assetType,back = resource => {}){
        cc.loader.loadRes(url,assetType,(error,resource) => {
            if(!error){
                back && back(resource);
            }else{
                this.___loadSignalItem___(url,assetType,back);
            }
        })
    }    
//-----------------------------------------------------------------
    /**
     * 
     * @param {*} url 资源路径
     * @param {*} assetType 资源类型
     * @param {*} eventName 成功事件名
     * @param {*} saved 是否存储
     * @param {*} callFunc 成功回调（一般不用，建议使用事件通知）
     */
    loadItem(url,assetType,eventName,saved = true,callFunc = null){
        let store = this.getStore(assetType);
        let baseResName = url.split("/").pop();
        let resultResource = null;
        if(store){
            resultResource = store.getItem(baseResName);
        }
        if(!resultResource){
            let key = url + assetType.name;
            let callList = this.__cacheLoadingMap__[key];
            if(!callList){
                this.__cacheLoadingMap__[key] = callList = [];
                this.___loadSignalItem___(url,assetType,resource => {
                    resultResource = resource;
                    if(resultResource){
                        eventName = eventName || key;
                        cc.director.emit(eventName,resource);
                        saved && store && store.setItem(baseResName,resource);
                        // callFunc && callFunc(resultResource);
                        callList.length > 0 && callList.forEach( func => func(resultResource));
                        delete this.__cacheLoadingMap__[key];
                    }
                });
            }

            callFunc && callList.push(callFunc);
        }else{
            callFunc && callFunc(resultResource);
            eventName && cc.director.emit(eventName,resource);
        }
        
    }

    /**
     *删除资源 
     * @param {*} url  资源路径
     * @param {*} assetType 资源类型
     */
    deleteItem(url,assetType){
        cc.loader.releaseRes(url);
        let store = this.getStore(assetType);
        let baseResName = url.split("/").pop();
        return store ? store.deleteItem(baseResName) : false;
    }

    /**
     *  使用资源
     * @param {*} sprite 显示对象
     * @param {*} url 资源路径
     * @param {*} assetType 资源类型
     * @param {*} isAtlas 是否图集
     * @param {*} patchName 图片名字
     */
    useSpriteFrame(sprite,url, assetType = cc.SpriteFrame, isAtlas = false,patchName = null){
        this.loadItem(url,assetType,null,true,resource => {
            if(cc.isValid(sprite)){
                sprite.spriteFrame = isAtlas ? resource.getSpriteFrame(patchName) : resource;
            }
        })
    }
}



/**
 * 加载列表
 */
class ModulePreload{
    constructor(){
        this.resources = null;
        this.totalCount = 0;
        this.completedCount = 0;
        this.loadIndex = 0;
    }

    load(resources,size = 1){
        this.resources = resources;

        this.completedCount = 0;
        this.loadIndex = 0;
        this.totalCount = this.resources.length;
        size = Math.min(size,this.totalCount);
        for(let i = 0; i < size;i++){
            let item = this.resources[this.loadIndex++];
            this.__preLoadItem(item);
        }
    }

    unload(){
        this.resources.forEach(item => RES.deleteItem(item.url,item.type));
        this.resources = null;
    }

    __preLoadItem(item){
        let baseResName = item.url.split("/").pop();
        let store = RES.getStore(item.type);
        cc.loader.loadRes(item.url,item.type,(error,resource) => {
            if(!error){
                store && store.setItem(baseResName,resource);
                this.___loadComplete();
            }else{
                this.__preLoadItem(item);
            }
        });
    }

    ___loadComplete(){
        this.completedCount++;
        // console.log(`------ loadIndex = ${this.loadIndex} totalCount = ${this.totalCount}
        //     complete = ${this.completedCount} total = ${this.totalCount}`);
        if(this.completedCount < this.totalCount){
            cc.director.emit(RES.LOADING,Math.floor(this.completedCount * 100 / this.totalCount));
            if(this.loadIndex  < this.totalCount){
                let item = this.resources[this.loadIndex++];
                this.__preLoadItem(item);
            }
        }else{
            cc.director.emit(RES.COMPLETE);
        }
    }
}

/**
 * 远程头像（平台）
 */
class RemoteHeadLoader{
    constructor(){
        this.__cacheLoadingMap__ = {};
        this.__cacheSpriteFrame__ = {};

        this.__imageExt__ = [".png","jpg","PNG","JPG","JPEG"];
    }

    /**
     * 显示图片
     * @param {*} sprite 
     * @param {*} url 
     * @param {*} type 
     */
    useRemote(sprite,url,type){
        this.__load__(url,type,frame => {
            if(cc.isValid(sprite)){
                sprite.spriteFrame = frame;
            }
        });
    }

    __load__(url,type = "jpg",callFunc){
        let key = url + type;
        let cacheSpriteFrame = this.__cacheSpriteFrame__[key];
        if(!cacheSpriteFrame){
            let callList = this.__cacheLoadingMap__[key];
            if(!callList){
                callList = this.__cacheLoadingMap__[key] = [];
                this.__loadImageView__(url,type,tex => {
                    let frame = new cc.SpriteFrame(tex);
                    this.__cacheSpriteFrame__[key] = frame;
                    callList.length > 0 && callList.forEach(func => func(frame));
                    delete this.__cacheLoadingMap__[key];
                });
            }else{
                console.log("wait for loaded");
            }

            callFunc && callList.push(callFunc);
        }else{
            callFunc(cacheSpriteFrame);
        }
    }

    __isImageExt__(url){
        let ext = url.split(".").pop();
        if(ext in this.__imageExt__){
            return true;
        }

        return false;
    }

    __loadImageView__(url,type,callFunc){
        let func = (error,tex) => {
            if(error){
                this.__loadImageView__(url,type,callFunc)
            }else{
                callFunc(tex);
            }
        };

        this.__isImageExt__(url) ? cc.loader.load(url,func) : cc.loader.load({url,type},func);
    }
}

const remoteHandle = new RemoteHeadLoader();

cc.Sprite.prototype.useRemote = function(url,type = "jpg"){
    remoteHandle.useRemote(this,url,type);
} 

cc.Sprite.prototype.useSpriteFrame = function (url,assetType = cc.SpriteFrame,isAtlas = false,patchName = null){
    RES.useSpriteFrame(this,url,assetType,isAtlas,patchName)
} 


// dragonBones.DragonBonesAsset
//dragonBones.DragonBonesAtlasAsset



__R__.prototype.LOADING = "__res__loading__";
__R__.prototype.COMPLETE = "__res_load_complete__";

/**
 * 
 */
__R__.prototype.switchScene = function(name,callFunc = null){
    cc.director.preloadScene(name,err => {
        if(err){
            this.switchScene(name,enterAfterLoaded);
        }else{
            callFunc && callFunc();
        }
    });
}

const RES = new __R__();

const MODULE = new ModulePreload();

module.exports = RES;