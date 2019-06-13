
/**
*   author:ysjwdaypm
*  
**/

const {ccclass,property} = cc._decorator;

@ccclass
class TestMediator extends mh.BaseMediator{
    constructor(view){
        super(null,view);
    }

    onViewReady(){
        this.guiEvents(["select"]);
    }

    onGUI(evt,...parmas){
        switch(evt){
            case "select":
                // (this.node as mh.Group) 
                let data = this.view.selectedItem.getData();
                if(data == "15"){
                    mh.moduleStack.show("SecPanel");
                }else if(data == "12"){
                    mh.moduleStack.show("panel");
                }
                else{
                    mh.moduleStack.back();
                } 
                console.log("mediator select " + data);
            break;
        }
    }
}

@ccclass
class NewClass extends mh.BaseScrollView{

    // @property(cc.Node)
    // node = null;

    constructor(){
        super();
        new TestMediator(this);
    }

    //onLoad(){}
    
    start(){
        this.setData([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
            21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38],100,100,0.5,0.5);
    }

    //update(dt){}

    //onDestroy(){}
}

module.exports = NewClass;