
/**
*   author:ysjwdaypm
*  
**/

const {ccclass,property} = cc._decorator;


const {viewImp} = require("./../index");
const {BaseComponent,BaseMediator} = require("./MVC");
@ccclass
class BasePanel extends BaseComponent{

    @property(cc.Button)
    exitBtn = null;

    constructor(){
        super();
    }

    //onLoad(){}
    
    start(){
        this.exitBtn && this.exitBtn.on("click",this.onExitHanldle,this);
    }

    /**
     * 退出面板
     */
    onExitHanldle(){this.node.emit(this.EXIT)};

    //update(dt){}

    onDestroy(){
        this.exitBtn && this.exitBtn.off("click",this.onExitHanldle,this);
    }
}
BasePanel.prototype.EXIT = "BasePanel_exit";

class BasePanelMediator extends BaseMediator{
    constructor(model,node){
        super(model,node);
        this.subscribe([BasePanel.prototype.EXIT]);
    }

    onMessage(event){
        if(event == BasePanel.prototype.EXIT){
            viewImp.removeView(this.node);
        }
    }
}

module.exports = {
    BasePanel,
    BasePanelMediator
};