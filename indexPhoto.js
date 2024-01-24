const express=require('express')
const mongo  = require('mongodb');
const url = "mongodb+srv://wang8119:wang8119@cluster0.w3kipgk.mongodb.net/?retryWrites=true&w=majority"
const client = new mongo.MongoClient(url);
const bodyParser = require('body-parser');
const cors = require('cors')
let db = null
let result=null
// 初始化 MongoDB 的連線設定
async function initDB() {
    try {
          await client.connect()
          console.log('連線成功')
          db = client.db("myWebsite");

    } catch (err) {
          console.log('連線失敗', err)
          return
    }
}
initDB()
// 引入 Express 物件並放入變數 app 內
const app = express();
// 讓 API 可以跨域使用
app.use(cors())
// 設定解析內容最高為 10 MB
app.use(bodyParser.json({ limit: '10mb' }));
app.post('/save-screenshot',async(req,res)=>{
    try{
        // 告訴 MongoDB 要使用 savePhoto collection 
        const collection=db.collection('savePhoto')
        // 將 截取圖片的資訊放進 Post 內容內 (這裡的 base64,cutInfo 是此截圖套件自己預先設定的名稱)
        const { base64, cutInfo } = req.body;
        // 以 base64 先判斷所框選的範圍是否有被截取到
        if (!base64) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid screenshot data in the request body.',
            });
        }
        // 若有截取到，就將截取的資訊放進  savePhoto collecion 內
        result = await collection.insertOne({
            PhotoInfo: { base64, cutInfo },
        });
        // 將截取資訊打印出來
        console.log(result)
        // 這裡非必須，只是自己想要確認每一次放入截圖資訊時所產生 unique id 
        const insertedDocument = await collection.findOne({ _id: result.insertedId });
        // 將此 id 打印出來
        console.log(insertedDocument);  
        // 若成功放入，將截圖的資訊返回給前端，這樣前端可以使用此截圖資訊
        // 但通常都是另外寫一支 GET 方法的 API 去定義使用者在何時及哪種情況下要將截圖的資訊從 Database 中拿出來
        // 但其實更直覺的做法是直接在前端使用 const storedValue = sessionStorage.getItem('key') 直接將截圖的資訊
        // 取出來
        res.json({
            success:true,
            PhotoInfo:{ base64, cutInfo },
            message:'已經成功將圖片放進資料庫了 !'
        })

    }catch(error){
        console.log('無法將資料放進資料庫',error)
    }
})
app.listen(3000,()=>{
    console.log('Server running at port 3000 !')
})