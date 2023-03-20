const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
require('dotenv').config()

app.use('/public', express.static('public'));
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.use('/shop', require('./routes/shop.js') );
const{ ObjectId }= require('mongodb');




var db;
MongoClient.connect('mongodb+srv://admin:dlawlgus55!!@cluster0.yft1dyh.mongodb.net/?retryWrites=true&w=majority', 
function(에러, client){
  //연결되면 할일
  if(에러) return console.log(에러)

  db = client.db('todoapp');

  app.listen(8080, function(){
    console.log('listening on 8080')
  });

})
app.get('/pet', function(요청, 응답) { 
    응답.send('펫용품 사시오');
  });

  app.get('/beauty', function(요청, 응답) { 
    응답.send('뷰티용품 쇼핑 페이지임');
  });

  app.get('/', function(요청, 응답) { 
    응답.render('index.ejs');
  });

app.get('/write', function(요청, 응답) { 
  응답.render('write.ejs');
  });

  app.post('/add', function(요청, 응답){
    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
      console.log(결과.totalPost)
      var 총게시물갯수 = 결과.totalPost;

      db.collection('post').insertOne( { _id : 총게시물갯수 + 1, 제목 : 요청.body.title, 날짜 : 요청.body.date } , function(){
        console.log('저장완료');
        //counter라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜야함(수정);
        db.collection('counter').updateOne({name: '게시물갯수'}, { $inc: {totalPost: 1}}, function(에러, 결과){
          if(에러){return console.log('에러')}
          응답.send('전송완료');
        })
      });
    });
  });


app.get('/list', function(요청, 응답){
  //디비에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요
  db.collection('post').find().toArray(function(에러, 결과){
    console.log(결과);
    응답.render('list.ejs', { posts : 결과 });
  });
});

app.delete('/delete', function(요청, 응답){
  요청.body._id = parseInt(요청.body._id)
  db.collection('post').deleteOne(요청.body, function(에러, 결과){
    console.log('삭제완료')
  })
  응답.send('삭제완료')
});

app.get('/detail/:id', function(요청, 응답){
  db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
    응답.render('detail.ejs', {data : 결과} )
  })
});

app.get('/edit/:id', function(요청, 응답){
  db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
    응답.render('edit.ejs', { post : 결과 })
  })
  
})

app.put('/edit', function(요청, 응답){ 
  db.collection('post').updateOne( {_id : parseInt(요청.body.id) }, {$set : { 제목 : 요청.body.title , 날짜 : 요청.body.date }}, 
    function(에러, 결과){ 
    console.log('수정완료') 
    응답.redirect('/list') 
  }); 
}); 

app.get('/search', (요청, 응답)=>{

  var 검색조건 = [
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: 요청.query.value,
          path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        }
      }
    },
    { $sort : { _id : 1 } },
   { $limit : 10 },
   { $project : { 제목 : 1, _id : 0 } }
  ] 
  console.log(요청.query);
  db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{
    console.log(결과)
    응답.render('search.ejs', {posts : 결과})
  })
})



const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave: true,
saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(요청, 응답){
  응답.render('login.ejs')
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/fail'
}), function(요청, 응답){
   응답.redirect('/')
});

app.get('/mypage', 로그인했니, function(요청, 응답){
  console.log(요청.user);   
  응답.render('mypage.ejs', {사용자 : 요청.user})
})

function 로그인했니(요청, 응답, next){
  if(요청.user){
    next()
  }else{
    응답.send('로그인안하셨는데요?')
  }
}

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)
    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));
app.post('/chatroom', function(요청, 응답){

  var 저장할거 = {
    title : '무슨무슨채팅방',
    member : [ObjectId(요청.body.당한사람id), 요청.user._id],
    date : new Date()
  }

  db.collection('chatroom').insertOne(저장할거).then(function(결과){
    응답.send('저장완료')
  });
});

app.get('/chat', 로그인했니, function(요청, 응답){ 

  db.collection('chatroom').find({ member : 요청.user._id }).toArray().then((결과)=>{
    console.log(결과);
    응답.render('chat.ejs', {data : 결과})
  })

}); 

passport.serializeUser(function (user, done) {
  done(null, user.id)
});

passport.deserializeUser(function (아이디, done) {
  db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과)
  })
}); 



app.post('/register', function(요청, 응답){
   db.collection('login').insertOne({ id: 요청.body.id, pw:요청.body.pw },
    function(에러, 결과){
      응답.redirect('/')
    })
})

let multer = require('multer');
var storage = multer.diskStorage({
  destination : function(req, file, cb){
    cb(null, './public/image')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname)
  }
});

var upload = multer({storage : storage});
var path = require('path')
var upload = multer({storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        return callback(new Error('PNG, JPG만 업로드하세요'))
    }
    callback(null, true)
},
});

app.get('/upload', function(요청, 응답){
   응답.render('upload.ejs')
})

app.post('/upload', upload.single('profile'), function(요청, 응답){
  응답.send('업로드완료')
}); 

app.get('/image/:imageName', function(요청, 응답){
  응답.sendFile( __dirname + '/public/image/' + 요청.params.imageName )
})

app.get('/chat', function(요청, 응답){
  응답.render('chat.ejs')
})

