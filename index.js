const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { spawn } = require('child_process');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json()); // support json encoded bodies
// default options
app.use(fileUpload());


app.get('/', (req, res) => { 
    res.send('Hello World!')
});
app.post('/', (req, res) => {
    console.log(req.files.upload_file);
    let upload_file = req.files.upload_file;
    console.log(upload_file.md5);
    const file_name =  '/tmp/' +upload_file.md5  + upload_file.name;
    console.log(file_name);
    upload_file.mv( file_name, function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        const file_convert = spawn('soffice', ['--headless', '--convert-to' , 'pdf', '--outdir', '/tmp', file_name]);  
        file_convert.on('close', (code) => {
            const converted_file = file_name.replace(/\..+$/, '.pdf');
          console.log(code);

          res.sendFile(converted_file);
          console.log(`child process exited with code ${code}`);
          
          // after completinng conversion delete the file
          const delete_doc_file = spawn('rm', [file_name]);
          const delete_converted_file = spawn('rm', [converted_file]);

        });
      }); 
     
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
