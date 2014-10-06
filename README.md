
AdsScraper
============

Can scrape avto.net, bolha.com, njuskalo.hr.


0. Create config.json, example settings:
```json
[
    {
        "id": 1,
        "request": {
            "url": "http://www.avto.net/_MOTO/results.asp?znamka=&model=katerikoli&modelID=&tip=6007&znamka2=&model2=katerikoli&tip2=&znamka3=&model3=katerikoli&tip3=&cenaMin=0&cenaMax=999999&letnikMin=0&letnikMax=2090&bencin=&zavore=&pogon=&klima=&servo=&lastnik=&servis=&automatic=0&starost2=999&star1=&star2=1&star3=&star4=1&star5=1&karambolirano=0&oblika=0&oblika11=&oblika12=&oblika13=&oblika14=&oblika15=&oblika16=&oblika17=&ccmMin=0&ccmMax=9999&mocMin=0&mocMax=999&kmMin=0&kmMax=999999&kwMin=&kwMax=&motortakt=0&motorvalji=0&lokacija=0&izpis=1&brezcene=1&sirina=&dolzina=&dolzinaMIN=&dolzinaMAX=&nosilnostMIN=&nosilnostMAX=&lezisc=&presek=&premer=&col=&vijakov=&vozilo=&plin=&prodajalec=2&estekla=&leder=&navi=&alufelge=&sibedah=&gretje=&tempomat=&centralno=&vlecna=&aklima=&SLOavto=&xenonke=&espsistem=&garage=&airbag=&najem=0&hibrid=&garancija=0&barva=&broker=&checkall=&showguarantee=&weltauto=&levjapriloznost=0&G2=&toygar=&citroenselect=0&sedezev=&petzvezdic=0&paketgarancije=&topp=0&EKO=0&door=0&MEN=0&VIN=&kategorija=0&oglasrubrika=6&zaloga=10&presort=2&tipsort=ASC&stran=1&subSORT=3&subTIPSORT=DESC",
            "proxy": null,
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36"
            }
        },
        "titleKeywords": [
            "Aprilia",
            "ditech",
            "sr 50",
            "sr50"
        ],
        "maxPrice": 500,
        "minPrice": null,
        "subscribers": [
            "subscriber1@gmail.com"
        ]
    },
    {
        "id": 2,
        "request": {
            "url": "http://www.bolha.com/avto-moto/motociklizem/skuterji/scooter/?listingType=list",
            "proxy": null,
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36"
            }
        },
        "titleKeywords": [
            "Aprilia",
            "ditech",
            "sr 50",
            "sr50"
        ],
        "maxPrice": 500,
        "minPrice": null,
        "subscribers": [
            "subscriber1@gmail.com"
        ]
    },
    {
        "id": 3,
        "request": {
            "url": "http://www.njuskalo.hr/skuteri_do_50",
            "proxy": null,
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36"
            }
        },
        "titleKeywords": [
            "Aprilia",
            "ditech",
            "sr 50",
            "sr50"
        ],
        "maxPrice": 500,
        "minPrice": null,
        "subscribers": [
            "subscriber2@gmail.com"
        ]
    }
]
```
    
1. Create emailConf.js with following settings:

```json
//nodemailer settings
module.exports = {
    service : 'Gmail',
    auth : {
        user: 'john.smith@gmail.com',
        pass: 'johnsmithspassword'
    },
    from: 'John Smith Automation <john.smith@gmail.com>'
};
```

2. Edit config.json to suit your needs.

3. Run 'node main.js'