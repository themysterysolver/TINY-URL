import express from 'express';
import pool from './db.js';

const app = express();
app.use(express.json());

const BASE_URL = "http://localhost:3000/"; 


function generateShortCode(length = 6) {
  let s = 'abcdefghijklmnopqrstuvwzyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  let idx = Math.floor(Math.random()*s.length);
  let ans= ""
  for(let i=0;i<length;i++){
    ans+=s[idx];
    idx = Math.floor(Math.random()*s.length);
  }
  return ans;
}

// POST: Create a new short URL
app.post('/shorten', async (req, res) => {
  try{
    const {long_url} = req.body;

    //checking if it already exist
    const exists = await pool.query('SELECT * FROM urls where long_url = $1',[long_url]);
    if(exists.rows.length>0){
      return res.json(exists.rows[0]);
    }
    let code = generateShortCode(6);
    const surls = await pool.query('SELECT short_url from urls')
    //console.log(surls.rows);

    
    /*
    There are certain properties you should remember prabha,
    rows,rowcount,command
    and map returns and array
    */

    let arr = surls.rows.map(item=>item.short_url)
    while(arr.includes(code)){
      code=generateShortCode(6);
    }
    let result = await pool.query('INSERT INTO urls (long_url,short_url) VALUES ($1,$2) RETURNING *',[long_url,code])

    return res.json({shortend_url:BASE_URL+result.rows[0].short_url})
  }catch(e){
    console.error(e.message);
    res.status(500).send('SERVER ERROR');
  }
});

// GET: Optional - list all URLs
app.get('/urls', async (req, res) => {
  try{
    const q = await pool.query('SELECT long_url,short_url from urls')
    if(q.rows.length>0){
      return res.json(q.rows);
    } 
  }catch(e){
    console.error(e.message)
    return res.status(500).send('SERVER ERROR')
  }
});


// GET: Redirect short URL to long URL
app.get('/r/:short_url', async (req, res) => {
  try {
    const { short_url } = req.params;
    const exists = await pool.query('select * from urls where short_url = $1',[short_url]);
    if(exists.rows.length===0){
      return res.status(404).send('URL Not found');
    }
    let t = await pool.query('UPDATE urls SET last_used = NOW() where short_url = $1 returning *',[short_url])
    //console.log(t.rows)
    res.redirect(exists.rows[0].long_url);
  }catch(e){
    console.error(e.message)
    return res.status(500).send('SERVER ERROR')
  }
});

setInterval(async ()=>{
  try{
    let delr = await pool.query("DELETE FROM urls WHERE last_used < NOW() - INTERVAL '1 day'");
    console.log(delr.rows);
  }catch(e){
    console.error(e.message)
  }
},2*24*60*60*1000) //remember they are in ms 


app.listen(3000, () => console.log('Server running on port 3000'));
