const express = require("express");

const router = express.Router();

const validUrl = require("valid-url");
const shortid = require("shortid");
const englishUppercase = require("nanoid-generate/uppercase");
const Url = require("../models/Url");
var QRCode = require("qrcode");

//@route    POST /api/url/shorten
//@desc     Create short URL

const baseUrl = "http:localhost:5000";
router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  //check base url
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json("Invalid base URL");
  }
  // create url code
  // const urlCode = shortid.generate();
  const urlCode = englishUppercase(4);
  //check long url
  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl });
      if (url) {
        res.json(url);
      } else {
        const shortUrl = baseUrl + "/" + urlCode;
        // generate the qr code here
        const opts = {
          errorCorrectionLevel: "H",
          type: "svg",
          quality: 0.95,
          margin: 1,
          color: {
            dark: "#208698",
            light: "#FFF",
          },
        };
        const qrUrl = await QRCode.toString(shortUrl, opts);

        url = new Url({
          longUrl,
          shortUrl,
          urlCode,
          qrUrl,
          date: new Date(),
        });

        await url.save();
        res.json(url);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  } else {
    res.status(401).json("Invalid longUrl");
  }
});

// update of the short url's longUrl content
router.post("/update/:id", async (req, res) => {
  const { longUrl } = req.body;
  //check base url
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json("Invalid base URL");
  }
  Url.findByIdAndUpdate(
    req.params.id,
    {
      longUrl,
    },
    function (err, ret) {
      if (err) {
        res.status(200).json("更新失败");
        // console.log("更新失败");
      } else {
        res.status(401).json("更新成功");
        // console.log("更新成功");
      }
    }
  );
});
module.exports = router;
