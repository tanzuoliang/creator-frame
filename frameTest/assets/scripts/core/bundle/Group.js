
/**
*   author:ysjwdaypm
*  
**/

const {ccclass, property} = cc._decorator;
const {BaseComponent} = require("./MVC");
const BaseListItem = require("./BaseListItem"); 
@ccclass
class NewClass extends BaseComponent{

    @property(cc.Prefab)
    itemPrefab = null;

    @property
    itemScript = "";

    constructor(){
        super();
        this.__selectItem__ = null;
        this.__selectIndex__ = -1;
        this.__datas__ = null;
    }

    onDestroy(){
        super.onDestroy();
        this.__datas__ = null;
        this.__selectItem__ = null;
    }

    get selectedItem(){return this.__selectItem__;}

    setData(datas){
        this.__datas__ = datas;
    }

    set selectedIndex(index){
        this.__selectIndex__ = index;
    }

    get selectedIndex(){return this.__selectIndex__;}

    __onItemSelect__(bindScript,index){
        if(this.__selectItem__ == bindScript)return;
        if(bindScript){
            if(this.__selectItem__){
                this.__selectItem__.onunselected();
            }
            this.__selectIndex__ = index;
            this.__selectItem__ = bindScript;
            this.__selectItem__.onselected();
        }
    }

    __addNodeSelect__(node){
        node.on(BaseListItem.SELECT,this.__onItemSelect__,this);
    }
    
    __removeNodeSelect__(node){
        node.off(BaseListItem.SELECT,this.__onItemSelect__,this);
    }

}

module.exports = NewClass;