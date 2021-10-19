import express from 'express'
import { execFile } from 'child_process'
import exiftool from 'node-exiftool'
import exiftoolBin from 'dist-exiftool'
import multer from 'multer'
import cors from 'cors'

const metadata = {
  all: '', // remove all metadata at first
  Publisher: 'awesomewebsitewithgoogleads.fraud',
}

const PORT = process.env.PORT ?? 3001
const app = express()
const upload = multer({ dest: 'temp/' })

// app.use(cors())

app.post('/upload', upload.single('file'), (req, res, next) => {
  try {
    if (req.file) {
      const exiftoolProcessWriting = new exiftool.ExiftoolProcess(exiftoolBin)
      const exiftoolProcessReading1 = new exiftool.ExiftoolProcess(exiftoolBin)
      const exiftoolProcessReading2 = new exiftool.ExiftoolProcess(exiftoolBin)

      const responseData = {}

      /**
       * First reading
       */
      exiftoolProcessReading1
        .open()
        // display pid
        .then((pid) =>
          console.log('Started exiftool first reading process %s', pid)
        )
        .then(() =>
          exiftoolProcessReading1.readMetadata(req.file.path, ['-File:all'])
        )
        .then(console.log, console.error)
        .then(() => exiftoolProcessReading1.close())
        /**
         * Removing data
         */
        .then(() => exiftoolProcessWriting.open())
        // display pid
        .then((pid) => console.log('Started exiftool writing process %s', pid))
        .then(() =>
          exiftoolProcessWriting.writeMetadata(req.file.path, metadata, [
            'overwrite_original',
          ])
        )
        .then(console.log, console.error)
        .then(() => exiftoolProcessWriting.close())
        /**
         * Second reading
         */
        .then(() => exiftoolProcessReading2.open())
        // display pid
        .then((pid) =>
          console.log('Started exiftool second reading process %s', pid)
        )
        .then(() =>
          exiftoolProcessReading2.readMetadata(req.file.path, ['-File:all'])
        )
        .then(console.log, console.error)
        .then(() => exiftoolProcessReading2.close())
        .catch(console.error)

      res.send({
        status: true,
        message: 'File Uploaded!',
      })
    } else {
      res.status(400).send({
        status: false,
        data: 'File Not Found :(',
      })
    }
  } catch (err) {
    res.status(500).send(err)
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
