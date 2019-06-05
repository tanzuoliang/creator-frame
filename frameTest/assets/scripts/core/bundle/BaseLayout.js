const {ccclass, property} = cc._decorator;
const BaseListItem = require("./BaseListItem"); 
@ccclass
class BaseLayout extends require("./Group"){

    constructor(){
        super();
        this.__pageSize__ = 1;
        this.__totalSizes__ = 0;
        this.__totalPages__ = 0;
        this.__cacheItems__ = [];
    }

    setData(datas,pageSize){
        
        if(!datas || !pageSize){
            console.error("BaseLayout:setData parmas datas  and pageSize can not be nulll");
            return;
        }
        super.setData(datas);
        this.__pageSize__ = pageSize;
        this.__totalSizes__ = datas.length;
        this.__totalPages__ = Math.ceil(this.__totalSizes__ / this.__pageSize__);
    }

    show(pageIndex = 1){
        let startIndex = (pageIndex - 1) * this.__pageSize__;
        let endIndex = Math.min(this.__totalSizes__,pageIndex * this.__pageSize__);
        console.log(`startIndex = ${startIndex} endIndex = ${endIndex}`);
        let index = 0;
        for(let i = startIndex; i < endIndex;i++,index++){
            let node = null;
            if(this.__cacheItems__[i]){
                node = this.__cacheItems__[i];
                node.active = true;
            }else{
                node = cc.instantiate(this.itemPrefab);
                if(node){
                    this.__cacheItems__.push(node);
                    this.__addNodeSelect__(node);
                    node.parent = this.node;
                }
            }

            let script = node.getComponent(this.itemScript);
            if(script){
                script.setData(this.__datas__[i]);
            }else{
                console.log("can not find the script");
            }
        }

        for(let i = index,len = this.__cacheItems__.length; i < len;i++){
            this.__cacheItems__[i].active = false;
        }
        
    }

    onDestroy(){
        this.super();
        this.__cacheItems__.forEach(node => cc.isValid(node) && this.__removeNodeSelect__(node));
        this.__cacheItems__ = null;
        this.__datas__ = null;
        this.__selectItem__ = null;

    }

    //test
    clean(){
        this.__cacheItems__.forEach(node => {
            if(cc.isValid(node)){
                this.__removeNodeSelect__(node);
                node.destroy();
            }
        });
        this.__cacheItems__ = null;
    }
}

module.exports = BaseLayout;