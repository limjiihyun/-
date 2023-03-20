var router = require('express').Router();

function 로그인했니(요청, 응답, next){
   if(요청.user){
     next()
   }else{
     응답.send('로그인안하셨는데요?')
   }
 }

router.use(로그인했니);//모든 라우터에 적용 해라

router.get('/shirts', 로그인했니, function(요청, 응답){
    응답.send('셔츠 파는 페이지입니다.');
 });
 
 router.get('/pants', 로그인했니, function(요청, 응답){
    응답.send('바지 파는 페이지입니다.');
 }); 
 
module.exports = router;
