class MyGameScene extends Phaser.Scene{
    constructor(){
        super({key:'MyGameScene'});
        this.player=null;
        this.enemyGroup=null;
        this.cursors=null;
        this.score=0;
        this.scoreText=null;
        this.coinGroup=null;
    }
    preload(){
        this.load.image('player','assets/player.png');
        this.load.image('tileset','assets/tileset.jpg');
        this.load.image('sky','assets/海.png');
        this.load.image('coin','assets/草原.png');
        this.load.spritesheet(
            'enemy',
            'assets/草原.png',
            {
                frameWidth:50,
                frameHeight:50
            }
        );
    }
    create(){
        //地形
        this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(20);
        const mapData=[
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        const map=this.make.tilemap({
            data: mapData,
            tileWidth:50,
            tileHeight:50
        });
        //コイン
        this.coinGroup=this.physics.add.group({
            immovable:true,
            allowGravity:false
        });
        this.coinGroup.create(550,225,'coin').setScale(0.1);
        this.coinGroup.create(600,225,'coin').setScale(0.1);
        this.coinGroup.create(650,225,'coin').setScale(0.1);

        this.scoreText=this.add.text(
            16,
            16,
            'Score: 0',
            {fontSize:'32px',fill:'black'}
        ).setScrollFactor(0);

        

        const tileset=map.addTilesetImage('tileset','tileset');
        const worldLayer=map.createLayer(0,tileset,0,0);
        worldLayer.setOrigin(0, 0);
        worldLayer.setCollision([1,2,3]);

        //プレイヤー
        this.player=this.physics.add.sprite(100,280,'player').setScale(0.1).refreshBody();
        this.player.setCollideWorldBounds(true);

        //敵
        this.enemyGroup=this.physics.add.group({
            defaultKey:'enemy',
            setGravityY:300,
            collideWorldBounds:true
        });
        this.physics.add.overlap(this.player,this.coinGroup,this.collectCoin,null,this);

        const enemyData=[
            {x:300,y:280,key:'enemy'},
            {x:400,y:280,key:'enemy'},
            {x:500,y:280,key:'enemy'}
        ];
//！！
        enemyData.forEach(data=>{
            const enemy=this.enemyGroup.create(data.x,data.y,data.key);
            enemy.setVelocityX(-100);
        });

        //キー操作 this.cursors=this.input.keyboard.createCursorKeys();
        this.cursors=this.input.keyboard.createCursorKeys();
        //カメラ
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0,0,2000,500);
        //当たり判定
        this.physics.add.collider(this.player,worldLayer);
        this.physics.add.collider(this.enemyGroup,worldLayer);
        this.physics.add.collider(this.player,this.enemyGroup,this.hitEnemy,null,this);
        
    }
    hitEnemy(player,enemy){
        //プレイヤーを消して、物理演算無効にし、非表示にする。敵の動きを止める
        if(player.body.velocity.y>0 && player.body.y<enemy.body.y){
            enemy.disableBody(true,true);
            player.setVelocityY(-100);
        }else{
            player.disableBody(true,true);
            enemy.setVelocityX(0);
            this.add.text(
                this.cameras.main.midPoint.x,
                this.cameras.main.midPoint.y,
                'GAME OVER',
                {fontSize:'32',fill:'red'}
            ).setOrigin(0.5).setScrollFactor(0);
            this.physics.pause();
        }
        
        //this.physics.resume();で再開可能
    }
    collectCoin(player,coin){
        coin.disableBody(true,true);
        this.score+=10;
        this.scoreText.setText('Score:'+this.score);
    }
    update(){
        if(this.player.active){
            if(this.cursors.right.isDown){
                this.player.setVelocityX(100);
            }else if(this.cursors.left.isDown){
                this.player.setVelocityX(-100);
            }else{
                this.player.setVelocityX(0);
            }
            if(this.cursors.up.isDown && this.player.body.onFloor()){
                this.player.setVelocityY(-330);
            }
        }
        this.enemyGroup.children.each(function(enemy){
            if(enemy.active){
                if(enemy.body.blocked.left){
                    enemy.setVelocityX(100);
                    enemy.setFlipX(true);
                }else if(enemy.body.blocked.right){
                    enemy.setVelocityX(-100);
                    enemy.setFlipX(false);
                }
            }
        },this);
    }
    
}

const config={
    type:Phaser.AUTO,
    width:2000,
    height:500,
    physics:{
        default:'arcade',
        arcade:{
            gravity:{y:300},
            debug:true
        }
    },
    scene:MyGameScene
}


const game=new Phaser.Game(config);
