// Generated snapshot of the aggregate endpoints and the default run-list
// pages, harvested from the production D1 database. Served by fallback.ts
// when the D1 daily read quota is exhausted so the site keeps working on
// stale-but-real data. Regenerate after each daily sync.

export const FALLBACKS: Record<string, unknown> = {
  "GET /api/stats/summary": {
    "total_runs": 46553,
    "unique_bioprojects": 808,
    "unique_biosamples": 40870,
    "total_bases": 96890858729508,
    "date_min": "2012-04-15 03:23:43",
    "date_max": "2026-09-04 10:08:39"
  },
  "GET /api/stats/timeseries": [
    {
      "year": 2012,
      "runs": 5,
      "total_bases": 2399672290
    },
    {
      "year": 2013,
      "runs": 49,
      "total_bases": 20652021472
    },
    {
      "year": 2014,
      "runs": 376,
      "total_bases": 513793155747
    },
    {
      "year": 2015,
      "runs": 1414,
      "total_bases": 678401617007
    },
    {
      "year": 2016,
      "runs": 1098,
      "total_bases": 1393703005722
    },
    {
      "year": 2017,
      "runs": 1139,
      "total_bases": 1021027118245
    },
    {
      "year": 2018,
      "runs": 1018,
      "total_bases": 1145884347439
    },
    {
      "year": 2019,
      "runs": 2092,
      "total_bases": 1531947469405
    },
    {
      "year": 2020,
      "runs": 2671,
      "total_bases": 1917156803166
    },
    {
      "year": 2021,
      "runs": 3986,
      "total_bases": 11385075418686
    },
    {
      "year": 2022,
      "runs": 5636,
      "total_bases": 8995297340784
    },
    {
      "year": 2023,
      "runs": 3526,
      "total_bases": 6172881816431
    },
    {
      "year": 2024,
      "runs": 9728,
      "total_bases": 14689557172692
    },
    {
      "year": 2025,
      "runs": 8253,
      "total_bases": 28484837597492
    },
    {
      "year": 2026,
      "runs": 5562,
      "total_bases": 18938244172930
    }
  ],
  "GET /api/stats/top?dimension=organism": [
    {
      "name": "coral metagenome",
      "runs": 4659,
      "total_bases": 4925664063360
    },
    {
      "name": "soil metagenome",
      "runs": 3524,
      "total_bases": 975354353198
    },
    {
      "name": "metagenome",
      "runs": 3425,
      "total_bases": 2334015562854
    },
    {
      "name": "Homo sapiens",
      "runs": 3032,
      "total_bases": 13775562462263
    },
    {
      "name": "marine metagenome",
      "runs": 2535,
      "total_bases": 1510416576462
    },
    {
      "name": "Klebsiella pneumoniae 11227-1",
      "runs": 1986,
      "total_bases": 2292108384396
    },
    {
      "name": "Staphylococcus aureus",
      "runs": 1929,
      "total_bases": 2375278932157
    },
    {
      "name": "Acinetobacter baumannii",
      "runs": 1792,
      "total_bases": 2157629823800
    },
    {
      "name": "seawater metagenome",
      "runs": 1675,
      "total_bases": 866710193003
    },
    {
      "name": "Pseudomonas aeruginosa",
      "runs": 1511,
      "total_bases": 1995330663931
    },
    {
      "name": "sediment metagenome",
      "runs": 1510,
      "total_bases": 305765926677
    },
    {
      "name": "marine sediment metagenome",
      "runs": 1260,
      "total_bases": 379017940271
    },
    {
      "name": "root metagenome",
      "runs": 1210,
      "total_bases": 156063695674
    },
    {
      "name": "wastewater metagenome",
      "runs": 1198,
      "total_bases": 7140351412463
    },
    {
      "name": "Severe acute respiratory syndrome coronavirus 2",
      "runs": 1041,
      "total_bases": 1406856057037
    }
  ],
  "GET /api/stats/top?dimension=platform": [
    {
      "name": "ILLUMINA",
      "runs": 37414,
      "total_bases": 75680427710327
    },
    {
      "name": "DNBSEQ",
      "runs": 5186,
      "total_bases": 7569896096452
    },
    {
      "name": "OXFORD_NANOPORE",
      "runs": 1307,
      "total_bases": 2355017117221
    },
    {
      "name": "LS454",
      "runs": 1164,
      "total_bases": 7301203310
    },
    {
      "name": "PACBIO_SMRT",
      "runs": 576,
      "total_bases": 8712265622172
    },
    {
      "name": "ION_TORRENT",
      "runs": 534,
      "total_bases": 55806361277
    },
    {
      "name": "CAPILLARY",
      "runs": 183,
      "total_bases": 69217
    },
    {
      "name": "BGISEQ",
      "runs": 150,
      "total_bases": 2387840713282
    },
    {
      "name": "ELEMENT",
      "runs": 34,
      "total_bases": 100704647600
    },
    {
      "name": "ABI_SOLID",
      "runs": 5,
      "total_bases": 21599188650
    }
  ],
  "GET /api/stats/top?dimension=institution": [
    {
      "name": "KAUST",
      "runs": 27181,
      "total_bases": 58997409876555
    },
    {
      "name": "UNIVERSITY OF KONSTANZ",
      "runs": 3148,
      "total_bases": 3191030663590
    },
    {
      "name": "MNHN",
      "runs": 2674,
      "total_bases": 340476499897
    },
    {
      "name": "Imam Abdulrahman Bin Faisal University",
      "runs": 2222,
      "total_bases": 7306241116544
    },
    {
      "name": "CIRAD",
      "runs": 1204,
      "total_bases": 418943801886
    },
    {
      "name": "WASEDA",
      "runs": 1133,
      "total_bases": 430893068700
    },
    {
      "name": "King Abdulaziz University",
      "runs": 790,
      "total_bases": 866473249440
    },
    {
      "name": "CAWTHRON",
      "runs": 723,
      "total_bases": 64269032479
    },
    {
      "name": "KAIMRC",
      "runs": 566,
      "total_bases": 232726263068
    },
    {
      "name": "King Faisal Specialist Hospital",
      "runs": 340,
      "total_bases": 1129848038017
    },
    {
      "name": "THE UNIVERSITY OF MELBOURNE",
      "runs": 295,
      "total_bases": 518957077266
    },
    {
      "name": "UNIVERSITY OF MELBOURNE",
      "runs": 284,
      "total_bases": 270318306800
    },
    {
      "name": "DEPARTMENT OF EARTH AND ENVIRONMENTAL SCIENCES, LM",
      "runs": 268,
      "total_bases": 49436038511
    },
    {
      "name": "King Saud University",
      "runs": 230,
      "total_bases": 1535307739762
    },
    {
      "name": "EPFL",
      "runs": 217,
      "total_bases": 980219121158
    }
  ],
  "GET /api/stats/saudi-split": {
    "saudi": {
      "runs": 32104,
      "total_bases": 72170016834356
    },
    "non_saudi": {
      "runs": 14449,
      "total_bases": 24720841895152
    }
  },
  "GET /api/stats/library-strategies": [
    {
      "name": "AMPLICON",
      "runs": 24564,
      "total_bases": 9267608241109
    },
    {
      "name": "WGS",
      "runs": 13127,
      "total_bases": 60651023679922
    },
    {
      "name": "RNA-Seq",
      "runs": 3530,
      "total_bases": 15746560813834
    },
    {
      "name": "RAD-Seq",
      "runs": 1552,
      "total_bases": 2180064790406
    },
    {
      "name": "WGA",
      "runs": 1395,
      "total_bases": 981100058378
    },
    {
      "name": "OTHER",
      "runs": 1077,
      "total_bases": 1808633777722
    },
    {
      "name": "Targeted-Capture",
      "runs": 989,
      "total_bases": 1219786926013
    },
    {
      "name": "WXS",
      "runs": 146,
      "total_bases": 1294151446821
    },
    {
      "name": "miRNA-Seq",
      "runs": 101,
      "total_bases": 97889783936
    },
    {
      "name": "Hi-C",
      "runs": 43,
      "total_bases": 3334314594754
    },
    {
      "name": "FL-cDNA",
      "runs": 11,
      "total_bases": 76307796384
    },
    {
      "name": "Tn-Seq",
      "runs": 4,
      "total_bases": 26328761962
    },
    {
      "name": "ChIP-Seq",
      "runs": 4,
      "total_bases": 111171173100
    },
    {
      "name": "Synthetic-Long-Read",
      "runs": 3,
      "total_bases": 92576162791
    },
    {
      "name": "GBS",
      "runs": 3,
      "total_bases": 262486301
    },
    {
      "name": "EST",
      "runs": 2,
      "total_bases": 314094357
    },
    {
      "name": "SELEX",
      "runs": 1,
      "total_bases": 95932000
    },
    {
      "name": "FINISHING",
      "runs": 1,
      "total_bases": 2668209718
    }
  ],
  "GET /api/stats/wgs-trend": [
    {
      "year": 2012,
      "runs": 5,
      "total_bases": 2399672290
    },
    {
      "year": 2013,
      "runs": 5,
      "total_bases": 13991612356
    },
    {
      "year": 2014,
      "runs": 20,
      "total_bases": 157330670937
    },
    {
      "year": 2015,
      "runs": 239,
      "total_bases": 321165882198
    },
    {
      "year": 2016,
      "runs": 66,
      "total_bases": 732608573978
    },
    {
      "year": 2017,
      "runs": 46,
      "total_bases": 60695887918
    },
    {
      "year": 2018,
      "runs": 73,
      "total_bases": 237838036746
    },
    {
      "year": 2019,
      "runs": 92,
      "total_bases": 411979144991
    },
    {
      "year": 2020,
      "runs": 420,
      "total_bases": 617766617183
    },
    {
      "year": 2021,
      "runs": 417,
      "total_bases": 7245378577744
    },
    {
      "year": 2022,
      "runs": 403,
      "total_bases": 664052594399
    },
    {
      "year": 2023,
      "runs": 2070,
      "total_bases": 4396876683983
    },
    {
      "year": 2024,
      "runs": 2469,
      "total_bases": 7129364993327
    },
    {
      "year": 2025,
      "runs": 4042,
      "total_bases": 15549470178470
    },
    {
      "year": 2026,
      "runs": 875,
      "total_bases": 8172018833746
    }
  ],
  "GET /api/search/facets": {
    "platforms": [
      {
        "name": "ILLUMINA",
        "runs": 37414
      },
      {
        "name": "DNBSEQ",
        "runs": 5186
      },
      {
        "name": "OXFORD_NANOPORE",
        "runs": 1307
      },
      {
        "name": "LS454",
        "runs": 1164
      },
      {
        "name": "PACBIO_SMRT",
        "runs": 576
      },
      {
        "name": "ION_TORRENT",
        "runs": 534
      },
      {
        "name": "CAPILLARY",
        "runs": 183
      },
      {
        "name": "BGISEQ",
        "runs": 150
      },
      {
        "name": "ELEMENT",
        "runs": 34
      },
      {
        "name": "ABI_SOLID",
        "runs": 5
      }
    ]
  },
  "GET /api/institutions": {
    "items": [
      {
        "name": "KAUST",
        "is_saudi": true,
        "runs": 27181
      },
      {
        "name": "UNIVERSITY OF KONSTANZ",
        "is_saudi": false,
        "runs": 3148
      },
      {
        "name": "MNHN",
        "is_saudi": false,
        "runs": 2674
      },
      {
        "name": "Imam Abdulrahman Bin Faisal University",
        "is_saudi": true,
        "runs": 2222
      },
      {
        "name": "CIRAD",
        "is_saudi": false,
        "runs": 1204
      },
      {
        "name": "WASEDA",
        "is_saudi": false,
        "runs": 1133
      },
      {
        "name": "King Abdulaziz University",
        "is_saudi": true,
        "runs": 790
      },
      {
        "name": "CAWTHRON",
        "is_saudi": false,
        "runs": 723
      },
      {
        "name": "KAIMRC",
        "is_saudi": true,
        "runs": 566
      },
      {
        "name": "King Faisal Specialist Hospital",
        "is_saudi": true,
        "runs": 340
      },
      {
        "name": "THE UNIVERSITY OF MELBOURNE",
        "is_saudi": false,
        "runs": 295
      },
      {
        "name": "UNIVERSITY OF MELBOURNE",
        "is_saudi": false,
        "runs": 284
      },
      {
        "name": "DEPARTMENT OF EARTH AND ENVIRONMENTAL SCIENCES, LM",
        "is_saudi": false,
        "runs": 268
      },
      {
        "name": "King Saud University",
        "is_saudi": true,
        "runs": 230
      },
      {
        "name": "EPFL",
        "is_saudi": false,
        "runs": 217
      },
      {
        "name": "JUSTUS LIEBIG UNIVERSITY GIESSEN",
        "is_saudi": false,
        "runs": 194
      },
      {
        "name": "UNIVERSITY OF TARTU",
        "is_saudi": false,
        "runs": 193
      },
      {
        "name": "RED SEA RESEARCH CENTER",
        "is_saudi": false,
        "runs": 176
      },
      {
        "name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "is_saudi": false,
        "runs": 173
      },
      {
        "name": "Taibah University",
        "is_saudi": true,
        "runs": 164
      },
      {
        "name": "King Faisal University",
        "is_saudi": true,
        "runs": 160
      },
      {
        "name": "NEW YORK UNIVERSITY ABU DHABI",
        "is_saudi": false,
        "runs": 125
      },
      {
        "name": "University of Tabuk",
        "is_saudi": true,
        "runs": 122
      },
      {
        "name": "Umm Al-Qura University",
        "is_saudi": true,
        "runs": 117
      },
      {
        "name": "TEMPLE UNIVERSITY",
        "is_saudi": false,
        "runs": 115
      },
      {
        "name": "HACKENSACK-MERIDIAN HEALTH CENTER FOR DISCOVERY AND INNOVATION",
        "is_saudi": false,
        "runs": 109
      },
      {
        "name": "OCEANX",
        "is_saudi": false,
        "runs": 108
      },
      {
        "name": "UNIVERSITY OF NOTTINGHAM",
        "is_saudi": false,
        "runs": 105
      },
      {
        "name": "KING SAUDI UNIVERSITY",
        "is_saudi": false,
        "runs": 97
      },
      {
        "name": "King Abdulaziz City for Science and Technology",
        "is_saudi": true,
        "runs": 93
      },
      {
        "name": "ARMAUER HANSEN RESEARCH INSTITUTE",
        "is_saudi": false,
        "runs": 88
      },
      {
        "name": "UNIVERSITY OF CENTRAL FLORIDA",
        "is_saudi": false,
        "runs": 87
      },
      {
        "name": "SAUDI FOOD AND DRUG AUTHORITY",
        "is_saudi": false,
        "runs": 86
      },
      {
        "name": "COSMOSID",
        "is_saudi": false,
        "runs": 84
      },
      {
        "name": "GBW",
        "is_saudi": false,
        "runs": 84
      },
      {
        "name": "UNITE DE RECHERCHE SUR LES MALADIES INFECTIEUSES E",
        "is_saudi": false,
        "runs": 83
      },
      {
        "name": "UNIVERSITY OF CALIFORNIA SAN DIEGO MICROBIOME INIT",
        "is_saudi": false,
        "runs": 83
      },
      {
        "name": "PRINCESS NORAH BINT ABDULRAHMAN UNIVERSITY",
        "is_saudi": false,
        "runs": 80
      },
      {
        "name": "CENTRE FOR GENOMIC EPIDEMIOLOGY, NATIONAL FOOD INS",
        "is_saudi": false,
        "runs": 76
      },
      {
        "name": "UNIVERSITY OF ESSEX",
        "is_saudi": false,
        "runs": 74
      },
      {
        "name": "COLUMBIA UNIVERSITY",
        "is_saudi": false,
        "runs": 72
      },
      {
        "name": "AALBORG UNIVERSITY",
        "is_saudi": false,
        "runs": 58
      },
      {
        "name": "KING FAHAD MEDICAL CITY",
        "is_saudi": false,
        "runs": 58
      },
      {
        "name": "BIOPOLIS/CIBIO-INBIO",
        "is_saudi": false,
        "runs": 55
      },
      {
        "name": "UNIVERSITY OF BREMEN",
        "is_saudi": false,
        "runs": 55
      },
      {
        "name": "CENTER FOR DESERT AGRICULTURE",
        "is_saudi": false,
        "runs": 52
      },
      {
        "name": "GRONINGEN UNIVERSITY",
        "is_saudi": false,
        "runs": 52
      },
      {
        "name": "KOBENHAVN UNIVERSITET",
        "is_saudi": false,
        "runs": 51
      },
      {
        "name": "ESSEX UNIVERSITY UK",
        "is_saudi": false,
        "runs": 50
      },
      {
        "name": "UNIVERSITY OF QUEENSLAND",
        "is_saudi": false,
        "runs": 47
      },
      {
        "name": "UNIVERSITY OF GLASGOW",
        "is_saudi": false,
        "runs": 45
      },
      {
        "name": "VERILY LIFE SCIENCES",
        "is_saudi": false,
        "runs": 45
      },
      {
        "name": "BGI",
        "is_saudi": false,
        "runs": 41
      },
      {
        "name": "CENTER OF EXCELLENCE- SUSTAINABILITY AND FOOD SECU",
        "is_saudi": false,
        "runs": 38
      },
      {
        "name": "Qassim University",
        "is_saudi": true,
        "runs": 37
      },
      {
        "name": "BOYCE THOMPSON INSTITUTE",
        "is_saudi": false,
        "runs": 36
      },
      {
        "name": "CFSAN",
        "is_saudi": false,
        "runs": 36
      },
      {
        "name": "WOODS HOLE OCEANOGRAPHIC INSTITUTION",
        "is_saudi": false,
        "runs": 36
      },
      {
        "name": "KFUPM",
        "is_saudi": true,
        "runs": 32
      },
      {
        "name": "THE AMERICAN UNIVERSITY IN CAIRO (AUC)",
        "is_saudi": false,
        "runs": 32
      },
      {
        "name": "UNIVERSITE DE SHERBROOKE",
        "is_saudi": false,
        "runs": 31
      },
      {
        "name": "UNIVERSITY OF SYDNEY",
        "is_saudi": false,
        "runs": 31
      },
      {
        "name": "INSTITUTE OF GENOMICS, UNIVERSITY OF TARTU",
        "is_saudi": false,
        "runs": 30
      },
      {
        "name": "UNIVERSITY OF ALASKA FAIRBANKS",
        "is_saudi": false,
        "runs": 29
      },
      {
        "name": "Cryptogam biology and functional trait ecology Reseach Group;CryptoFunk",
        "is_saudi": false,
        "runs": 26
      },
      {
        "name": "UC SANTA CRUZ",
        "is_saudi": false,
        "runs": 26
      },
      {
        "name": "Jazan University",
        "is_saudi": true,
        "runs": 25
      },
      {
        "name": "CNRS",
        "is_saudi": false,
        "runs": 24
      },
      {
        "name": "FACULTY OF PHARMACY, CAIRO UNIVERSITY",
        "is_saudi": false,
        "runs": 24
      },
      {
        "name": "JMF",
        "is_saudi": false,
        "runs": 24
      },
      {
        "name": "MCMASTER UNIVERSITY",
        "is_saudi": false,
        "runs": 24
      },
      {
        "name": "Majmaah University",
        "is_saudi": true,
        "runs": 23
      },
      {
        "name": "KING ABDULAZIZ UNIVIRSTY",
        "is_saudi": false,
        "runs": 22
      },
      {
        "name": "UNIVERSITY OF JEDDAH",
        "is_saudi": false,
        "runs": 21
      },
      {
        "name": "UNIVERSITY OF WUERZBURG",
        "is_saudi": false,
        "runs": 21
      },
      {
        "name": "TEMPLE UNIVERSITY - KORNBERG SCHOOL OF DENTITSRY",
        "is_saudi": false,
        "runs": 20
      },
      {
        "name": "AIMS",
        "is_saudi": false,
        "runs": 19
      },
      {
        "name": "SICHUAN AGRICULTURAL UNIVERSITY",
        "is_saudi": false,
        "runs": 19
      },
      {
        "name": "THE WESTMEAD INSTITUTE FOR MEDICAL RESEARCH AND MA",
        "is_saudi": false,
        "runs": 19
      },
      {
        "name": "AZTI TECNALIA",
        "is_saudi": false,
        "runs": 18
      },
      {
        "name": "ROYAL BOTANIC GARDENS, KEW",
        "is_saudi": false,
        "runs": 18
      },
      {
        "name": "CSIRO",
        "is_saudi": false,
        "runs": 17
      },
      {
        "name": "AIN SHAMS UNIVERSITY",
        "is_saudi": false,
        "runs": 16
      },
      {
        "name": "UCLA",
        "is_saudi": false,
        "runs": 16
      },
      {
        "name": "KUWAIT UNIVERSITY",
        "is_saudi": false,
        "runs": 15
      },
      {
        "name": "OKINAWA INSTITUTE OF SCIENCE AND TECHNOLOGY",
        "is_saudi": false,
        "runs": 15
      },
      {
        "name": "SUB1022130",
        "is_saudi": false,
        "runs": 15
      },
      {
        "name": "NATIONAL LIVESTOCK AND FISHERIES DEVELOPMENT PROGRAM",
        "is_saudi": false,
        "runs": 14
      },
      {
        "name": "CENTER FOR MICROBIAL COMMUNITIES",
        "is_saudi": false,
        "runs": 13
      },
      {
        "name": "EMBRYO",
        "is_saudi": false,
        "runs": 13
      },
      {
        "name": "GENALIVE",
        "is_saudi": false,
        "runs": 13
      },
      {
        "name": "AALA ABULFARAJ",
        "is_saudi": false,
        "runs": 12
      },
      {
        "name": "CENTER FOR DESERT AGRICULTURE, KING ABDULLAH UNIVE",
        "is_saudi": false,
        "runs": 12
      },
      {
        "name": "DR. FATEN DHAWI",
        "is_saudi": false,
        "runs": 12
      },
      {
        "name": "HELLENIC CENTRE FOR MARINE RESEARCH",
        "is_saudi": false,
        "runs": 12
      },
      {
        "name": "INSTITUTO SUPERIOR TECNICO (IST)",
        "is_saudi": false,
        "runs": 12
      },
      {
        "name": "MPIC (MAX-PLANCK-INSTITUTE FOR CHEMISTRY, GERMANY)",
        "is_saudi": false,
        "runs": 12
      },
      {
        "name": "TAHANI BAKHSH",
        "is_saudi": false,
        "runs": 12
      },
      {
        "name": "TRINITY COLLEGE DUBLIN",
        "is_saudi": false,
        "runs": 12
      },
      {
        "name": "ESTIDAMAH",
        "is_saudi": false,
        "runs": 11
      },
      {
        "name": "MOHAMMED BIN RASHID UNIVERSITY OF MEDICINE AND HEALTH SCIENCES",
        "is_saudi": false,
        "runs": 11
      },
      {
        "name": "JAMES COOK UNIVERSITY",
        "is_saudi": false,
        "runs": 10
      },
      {
        "name": "CAIRO UNIVERSITY",
        "is_saudi": false,
        "runs": 9
      },
      {
        "name": "G10K",
        "is_saudi": false,
        "runs": 9
      },
      {
        "name": "KYUNGPOOK NATIONAL UNIVERSITY",
        "is_saudi": false,
        "runs": 9
      },
      {
        "name": "UNIVERSITY OF EAST LONDON",
        "is_saudi": false,
        "runs": 9
      },
      {
        "name": "UNIVERSITY OF PAVIA",
        "is_saudi": false,
        "runs": 9
      },
      {
        "name": "WELLCOME SANGER INSTITUTE",
        "is_saudi": false,
        "runs": 9
      },
      {
        "name": "Xiongie and Abdugaffor",
        "is_saudi": false,
        "runs": 9
      },
      {
        "name": "DUBLIN DENTAL UNIVERSITY HOSPITAL",
        "is_saudi": false,
        "runs": 8
      },
      {
        "name": "IITP RAS",
        "is_saudi": false,
        "runs": 8
      },
      {
        "name": "JUNIATA COLLEGE",
        "is_saudi": false,
        "runs": 8
      },
      {
        "name": "STANFORD UNIVERSITY",
        "is_saudi": false,
        "runs": 8
      },
      {
        "name": "THE UNIVERSITY OF HONG KONG",
        "is_saudi": false,
        "runs": 8
      },
      {
        "name": "THE UNIVERSITY OF QUEENSLAND",
        "is_saudi": false,
        "runs": 8
      },
      {
        "name": "THE UNIVERSITY OF TEXAS AT AUSTIN",
        "is_saudi": false,
        "runs": 8
      },
      {
        "name": "UNIVERSITY OFTARTU",
        "is_saudi": false,
        "runs": 8
      },
      {
        "name": "AL-BAHA UNIVERSITY",
        "is_saudi": false,
        "runs": 7
      },
      {
        "name": "ALIGARH MUSLIM UNIVERSITY",
        "is_saudi": false,
        "runs": 7
      },
      {
        "name": "ANSES",
        "is_saudi": false,
        "runs": 7
      },
      {
        "name": "MAGEE-WOMENS RESEARCH INSTITUTE",
        "is_saudi": false,
        "runs": 7
      },
      {
        "name": "NEW YORK UNIVERSITY",
        "is_saudi": false,
        "runs": 7
      },
      {
        "name": "PRM",
        "is_saudi": false,
        "runs": 7
      },
      {
        "name": "WASHINGTON STATE UNIVERSITY",
        "is_saudi": false,
        "runs": 7
      },
      {
        "name": "YORK UNIVERSITY",
        "is_saudi": false,
        "runs": 7
      },
      {
        "name": "ESTONIAN UNIVERSITY OF LIFE SCIENCES",
        "is_saudi": false,
        "runs": 6
      },
      {
        "name": "INSTITUTE OF EVOLUTIONARY BIOLOGY",
        "is_saudi": false,
        "runs": 6
      },
      {
        "name": "KING ABULAZIZ UNIVERSITY",
        "is_saudi": false,
        "runs": 6
      },
      {
        "name": "NSW DEPARTMENT OF PRIMARY INDUSTRIES",
        "is_saudi": false,
        "runs": 6
      },
      {
        "name": "ROSENSTIEL SCHOOL OF MARINE, ATMOSPHERIC, AND EARTH SCIENCE",
        "is_saudi": false,
        "runs": 6
      },
      {
        "name": "USTQIAN",
        "is_saudi": false,
        "runs": 6
      },
      {
        "name": "YALE UNIVERSITY",
        "is_saudi": false,
        "runs": 6
      },
      {
        "name": "BEIJING INSTITUTE OF GENOMICS, CHINESE ACADEMY OF",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "HELMHOLTZ CENTRE FOR ENVIRONMENTAL RESEARCH - UFZ.",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "KING ABDUL AZIZ UNIVERISITY",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "NATURALIS BIODIVERSITY CENTER",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "PRINCETON UNIVERSITY",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "SCRIPPS INSTITUTION OF OCEANOGRAPHY",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "SUN YAT-SEN UNIVERSITY",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "UNIVERSITE LIBRE DE BRUXELLES",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "UNIVERSITE PARIS SUD",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "UNIVERSITI MALAYSIA TERENGGANU",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "UNIVERSITY OF FLORIDA",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "UNIVERSITY OF NEBRASKA MEDICAL CENTER",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "UNIVERSITY OF STRASBOURG",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "VOOLSTRA LAB",
        "is_saudi": false,
        "runs": 5
      },
      {
        "name": "ANNAMALAI UNIVERSITY",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "BI",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "CDC-NCEZID-MDB",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "CHENGDU UNIVERSITY OF TRADITIONAL CHINESE MEDICINE",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "EDLB-CDC",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "FACULTY OF SCIENCE, CHARLES UNIVERSITY",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "JGI",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "KING ABDULLAH UNIVERSITY SCIENCE AND TECHNOLOGY",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "LEIBNIZ INSTITUTE OF PLANT GENETICS AND CROP PLANT",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "SC",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "TECHNICAL UNIVERSITY OF DENMARK",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "TENNESSEE TECH UNIVERSITY",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "UNIVERSITY OF VERMONT",
        "is_saudi": false,
        "runs": 4
      },
      {
        "name": "GLOBE INSITUTE",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "JAPAN AGENCY FOR MARINE-EARTH SCIENCE AND TECHNOLOGY",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "KANSAS STATE UNIVERSITY",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "KING ABDULAZIZ UNIVESITY",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "LEIBNIZ-INSTITUT DSMZ - GERMAN COLLECTION OF MICROORGANISMS AND CELL CULTURES GMBH",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "NATIONAL CENTER FOR WILDLIFE",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "PENNSYLVANIA STATE UNIVERSITY",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "REAL JARDIN BOTANICO, CSIC",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "ROYAL PRINCE ALFRED HOSPITAL",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "UMARU MUSA YARADUA UNIVERSITY, KATSINA",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "UMIGS",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "UNH",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "UNIVERSITY OF CALIFORNIA, LOS ANGELES",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "UNIVERSITY OF LIVERPOOL",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "UNIVERSITY OF TORINO",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "USAFSAM_PH",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "WEIZMANN INSTITUTE OF SCIENCE",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "YASER",
        "is_saudi": false,
        "runs": 3
      },
      {
        "name": "ANIMAL HEALTH TRUST",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "CDC-CORVD-LAB",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "CENTER FOR GENETICS AND INHERIED",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "DEEP, STOCKHOLM UNIVERSITY",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "HARVEY MUDD COLLEGE",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "HAVFORSKNINGSINSTITUTTET",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "INSTITUTE OF BIOINFORMATICS AND APPLIED BIOTECHNOLOGY",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "INSTITUTE OF MEDICINAL PLANT DEVELOPMENT, CHINESE ACADEMY OF MEDICAL SCIENCES",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "LGC Genomics GmbH (Berlin, Germany)",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "NIID",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "OSNABRUCK UNIVERSITY",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "RADBOUD UNIVERSITY NIJMEGEN",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "SMITHONIAN INTITUTION",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "UCSC",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "UNIVERSITY OF ALABAMA",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "UNIVERSITY OF BEDFORDSHIRE",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "UNIVERSITY OF CHICAGO",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "UNIVERSITY OF COLOGNE",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "UNIVERSITY OF DHAKA",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "UNIVERSITY OF HELSINKI",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "USDA, KANSAS STATE UNIVERSITY",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "UTRECHT UNIVERSITY",
        "is_saudi": false,
        "runs": 2
      },
      {
        "name": "WUGSC",
        "is_saudi": false,
        "runs": 2
      }
    ]
  },
  "GET /api/pathogens": {
    "top": [
      {
        "name": "Klebsiella pneumoniae 11227-1",
        "runs": 1986,
        "total_bases": 2292108384396
      },
      {
        "name": "Staphylococcus aureus",
        "runs": 1929,
        "total_bases": 2375278932157
      },
      {
        "name": "Acinetobacter baumannii",
        "runs": 1792,
        "total_bases": 2157629823800
      },
      {
        "name": "Pseudomonas aeruginosa",
        "runs": 1511,
        "total_bases": 1995330663931
      },
      {
        "name": "Severe acute respiratory syndrome coronavirus 2",
        "runs": 1041,
        "total_bases": 1406856057037
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Minnesota",
        "runs": 544,
        "total_bases": 471982289554
      },
      {
        "name": "Escherichia coli",
        "runs": 341,
        "total_bases": 591753088260
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Enteritidis",
        "runs": 277,
        "total_bases": 152083907709
      },
      {
        "name": "Klebsiella pneumoniae",
        "runs": 255,
        "total_bases": 318090413918
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Infantis",
        "runs": 14,
        "total_bases": 5637835185
      },
      {
        "name": "Salmonella",
        "runs": 13,
        "total_bases": 2019435259
      },
      {
        "name": "Middle East respiratory syndrome-related coronavirus",
        "runs": 11,
        "total_bases": 1184575759
      },
      {
        "name": "Salmonella enterica",
        "runs": 10,
        "total_bases": 6838768652
      },
      {
        "name": "Escherichia coli str. K-12 substr. DH10B",
        "runs": 7,
        "total_bases": 20467582530
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Bareilly",
        "runs": 3,
        "total_bases": 1171535916
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Cerro",
        "runs": 3,
        "total_bases": 919913140
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Heidelberg",
        "runs": 3,
        "total_bases": 1774511834
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Typhimurium",
        "runs": 3,
        "total_bases": 1358784976
      },
      {
        "name": "Salmonella enterica subsp. enterica",
        "runs": 2,
        "total_bases": 1024268985
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Enteritidis str. 76-0331",
        "runs": 2,
        "total_bases": 490610600
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Kentucky",
        "runs": 2,
        "total_bases": 744368484
      },
      {
        "name": "Acinetobacter baumannii 1032241",
        "runs": 1,
        "total_bases": 116190165
      },
      {
        "name": "Klebsiella pneumoniae subsp. pneumoniae",
        "runs": 1,
        "total_bases": 619643054
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Braenderup",
        "runs": 1,
        "total_bases": 483863796
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Concord",
        "runs": 1,
        "total_bases": 459644000
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Lagos",
        "runs": 1,
        "total_bases": 1241833060
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Montevideo",
        "runs": 1,
        "total_bases": 649263156
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Saintpaul str. CFSAN004160",
        "runs": 1,
        "total_bases": 915159324
      },
      {
        "name": "Salmonella enterica subsp. enterica serovar Wien",
        "runs": 1,
        "total_bases": 456446122
      }
    ],
    "by_year": [
      {
        "year": 2013,
        "runs": 1,
        "total_bases": 915159324
      },
      {
        "year": 2014,
        "runs": 2,
        "total_bases": 490610600
      },
      {
        "year": 2016,
        "runs": 26,
        "total_bases": 14475584923
      },
      {
        "year": 2017,
        "runs": 112,
        "total_bases": 142853465651
      },
      {
        "year": 2018,
        "runs": 154,
        "total_bases": 391195305872
      },
      {
        "year": 2019,
        "runs": 13,
        "total_bases": 22933991157
      },
      {
        "year": 2020,
        "runs": 261,
        "total_bases": 332757123530
      },
      {
        "year": 2021,
        "runs": 966,
        "total_bases": 1149569944900
      },
      {
        "year": 2022,
        "runs": 341,
        "total_bases": 238104691554
      },
      {
        "year": 2023,
        "runs": 1977,
        "total_bases": 2221096636167
      },
      {
        "year": 2024,
        "runs": 2196,
        "total_bases": 2551733223223
      },
      {
        "year": 2025,
        "runs": 3302,
        "total_bases": 3937412550405
      },
      {
        "year": 2026,
        "runs": 406,
        "total_bases": 806149507453
      }
    ]
  },
  "GET /api/stats/human": {
    "total_runs": 3032,
    "total_bases": 13775562462263,
    "by_year": [
      {
        "year": 2014,
        "runs": 7,
        "total_bases": 108106006400
      },
      {
        "year": 2020,
        "runs": 18,
        "total_bases": 617378652678
      },
      {
        "year": 2021,
        "runs": 1,
        "total_bases": 533483
      },
      {
        "year": 2022,
        "runs": 1695,
        "total_bases": 3159675319218
      },
      {
        "year": 2023,
        "runs": 74,
        "total_bases": 836391236915
      },
      {
        "year": 2024,
        "runs": 116,
        "total_bases": 3424833276378
      },
      {
        "year": 2025,
        "runs": 705,
        "total_bases": 4929381674021
      },
      {
        "year": 2026,
        "runs": 416,
        "total_bases": 699795763170
      }
    ],
    "top_institutions": [
      {
        "name": "Imam Abdulrahman Bin Faisal University",
        "runs": 2222,
        "total_bases": 7306241116544
      },
      {
        "name": "King Faisal Specialist Hospital",
        "runs": 318,
        "total_bases": 1106762751662
      },
      {
        "name": "KAUST",
        "runs": 122,
        "total_bases": 3983655940471
      },
      {
        "name": "King Faisal University",
        "runs": 120,
        "total_bases": 52804966220
      },
      {
        "name": "Taibah University",
        "runs": 113,
        "total_bases": 62900006309
      },
      {
        "name": "INSTITUTE OF GENOMICS, UNIVERSITY OF TARTU",
        "runs": 30,
        "total_bases": 42917748469
      },
      {
        "name": "University of Tabuk",
        "runs": 27,
        "total_bases": 310778983518
      },
      {
        "name": "King Abdulaziz University",
        "runs": 23,
        "total_bases": 210145737264
      },
      {
        "name": "Majmaah University",
        "runs": 23,
        "total_bases": 1598530000
      },
      {
        "name": "TAHANI BAKHSH",
        "runs": 12,
        "total_bases": 7673918450
      }
    ]
  },
  "GET /api/search?page=1": {
    "total": 46553,
    "page": 1,
    "page_size": 50,
    "items": [
      {
        "run_accession": "SRR37970284",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462333",
        "total_bases": 868060359,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:39",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970285",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462334",
        "total_bases": 1706999224,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970286",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462335",
        "total_bases": 1375768138,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970287",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462358",
        "total_bases": 954580729,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Alphaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970288",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462359",
        "total_bases": 883802440,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970289",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462360",
        "total_bases": 1619072042,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970291",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462361",
        "total_bases": 1051927865,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970292",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462362",
        "total_bases": 797198839,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Thalassarchaeaceae archaeon",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970293",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462363",
        "total_bases": 1508414607,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970294",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462364",
        "total_bases": 1275575963,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970295",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462387",
        "total_bases": 1169058122,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970296",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462388",
        "total_bases": 1158632973,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Gammaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970297",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462389",
        "total_bases": 802586805,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970298",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462390",
        "total_bases": 1185024701,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Fidelibacterota bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970300",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462391",
        "total_bases": 1158093682,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nanoarchaeia archaeon",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970301",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462392",
        "total_bases": 1358579117,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Nitrospirales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970302",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462393",
        "total_bases": 1215843020,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970303",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462451",
        "total_bases": 930607079,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:08:38",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37940371",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48485522",
        "total_bases": 1093931116,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:49",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971084",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462365",
        "total_bases": 1203853887,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971085",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462366",
        "total_bases": 855033525,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pacearchaeota archaeon",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971086",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462367",
        "total_bases": 1277839809,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971087",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462368",
        "total_bases": 982883009,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971088",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462369",
        "total_bases": 1468283181,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971089",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462370",
        "total_bases": 1036386498,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Fidelibacterota bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971091",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462371",
        "total_bases": 1250260643,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971092",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462394",
        "total_bases": 1364335789,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Nitrospinaceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971093",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462395",
        "total_bases": 1413806217,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Alphaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971094",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462396",
        "total_bases": 1369800378,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971095",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462397",
        "total_bases": 977467098,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Chloroflexota bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971096",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462398",
        "total_bases": 1489514764,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971097",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462399",
        "total_bases": 962467355,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971098",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462400",
        "total_bases": 597041953,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Myxococcota bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971100",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462416",
        "total_bases": 882247432,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacter sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971101",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462417",
        "total_bases": 801466140,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Arenicellales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971102",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462418",
        "total_bases": 938070354,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Limisphaerales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971103",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462419",
        "total_bases": 723968479,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Sphingomonas sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971104",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462420",
        "total_bases": 899580579,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Qipengyuania sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971106",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462421",
        "total_bases": 952871261,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971107",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462422",
        "total_bases": 946865955,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971108",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462423",
        "total_bases": 1446262323,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971109",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462424",
        "total_bases": 1442659771,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971110",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462425",
        "total_bases": 1015745826,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971111",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462426",
        "total_bases": 1386948959,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971112",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462427",
        "total_bases": 1001631431,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971113",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462428",
        "total_bases": 1032435675,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971114",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462429",
        "total_bases": 898271756,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Longimicrobiales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37971115",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462430",
        "total_bases": 966399360,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:26",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970976",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462286",
        "total_bases": 599501943,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Thalassarchaeum sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970977",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462287",
        "total_bases": 1165034150,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      }
    ]
  },
  "GET /api/search?page=2": {
    "total": 46553,
    "page": 2,
    "page_size": 50,
    "items": [
      {
        "run_accession": "SRR37970978",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462288",
        "total_bases": 757067965,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacter sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970979",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462289",
        "total_bases": 1021492715,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970980",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462290",
        "total_bases": 1075018051,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Nitrospinales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970982",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462291",
        "total_bases": 883734232,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970983",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462292",
        "total_bases": 702546487,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pseudothioglobus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970984",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462315",
        "total_bases": 983081966,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Gammaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970985",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462316",
        "total_bases": 1256547830,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Nitrospinaceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970986",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462317",
        "total_bases": 844042697,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Nitrospirales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970987",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462318",
        "total_bases": 993448671,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970988",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462319",
        "total_bases": 755197358,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacter sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:25",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970823",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462348",
        "total_bases": 1796754039,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970824",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462349",
        "total_bases": 2065339695,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970825",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462350",
        "total_bases": 1186377996,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970826",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462372",
        "total_bases": 1007198265,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Arenicellales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970827",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462373",
        "total_bases": 1080883287,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970828",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462374",
        "total_bases": 768157311,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970829",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462375",
        "total_bases": 1205202721,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970830",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462376",
        "total_bases": 904312996,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970831",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462377",
        "total_bases": 1213495966,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970832",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462378",
        "total_bases": 1175529396,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pseudothioglobus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970833",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462379",
        "total_bases": 1142864496,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Arenicellales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970834",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462401",
        "total_bases": 372402311,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Sphingomonas sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970835",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462402",
        "total_bases": 944157883,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970836",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462403",
        "total_bases": 1534083441,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970837",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462404",
        "total_bases": 1109496192,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pseudothioglobus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970838",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462405",
        "total_bases": 988797990,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Gammaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970839",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462406",
        "total_bases": 1090725724,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Nitrospirales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970840",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462407",
        "total_bases": 1232093110,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970841",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462408",
        "total_bases": 1189654822,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970844",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462431",
        "total_bases": 1207330181,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970845",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462432",
        "total_bases": 1442101799,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970846",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462433",
        "total_bases": 1144534242,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Hyphomicrobiales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970847",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462434",
        "total_bases": 1035868956,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Alphaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970848",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462435",
        "total_bases": 943591325,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970849",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462436",
        "total_bases": 975478004,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970989",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462320",
        "total_bases": 909824341,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970991",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462321",
        "total_bases": 904134546,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970992",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462343",
        "total_bases": 1664194929,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970993",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462344",
        "total_bases": 977599084,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970994",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462345",
        "total_bases": 1128094366,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970995",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462346",
        "total_bases": 1484597113,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970996",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462347",
        "total_bases": 1173817868,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:24",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970539",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462280",
        "total_bases": 863523553,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:22",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970541",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462281",
        "total_bases": 1275174131,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pseudothioglobus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:22",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970542",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462282",
        "total_bases": 1198585134,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:22",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970543",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462283",
        "total_bases": 1010394120,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:22",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970544",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462284",
        "total_bases": 683300116,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Poseidoniales archaeon",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:22",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970545",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462285",
        "total_bases": 505704091,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Thalassarchaeum sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:22",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970546",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462308",
        "total_bases": 1722988792,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:22",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970547",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462309",
        "total_bases": 1367558315,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:22",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      }
    ]
  },
  "GET /api/search?page=3": {
    "total": 46553,
    "page": 3,
    "page_size": 50,
    "items": [
      {
        "run_accession": "SRR37970275",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462304",
        "total_bases": 609701106,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Rhodospirillales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970276",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462305",
        "total_bases": 762087387,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Acidimicrobiales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970277",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462306",
        "total_bases": 1100603524,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970278",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462307",
        "total_bases": 736502284,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970279",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462330",
        "total_bases": 802260943,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pseudothioglobus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970282",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462331",
        "total_bases": 1291493644,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970283",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462332",
        "total_bases": 737586795,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970562",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462381",
        "total_bases": 1174708906,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Nitrospirales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970563",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462382",
        "total_bases": 1039493896,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970564",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462383",
        "total_bases": 1263253971,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970565",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462384",
        "total_bases": 1006219783,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970566",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462385",
        "total_bases": 1172589542,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970567",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462386",
        "total_bases": 989137660,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970568",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462409",
        "total_bases": 1574729509,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970569",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462410",
        "total_bases": 1288116554,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Nitrospinaceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970571",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462411",
        "total_bases": 1054131224,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Alphaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970572",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462412",
        "total_bases": 764686448,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Dehalococcoidia bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970573",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462413",
        "total_bases": 901910869,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Fidelibacterota bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970574",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462414",
        "total_bases": 1076802064,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970575",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462415",
        "total_bases": 1353041867,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970576",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462437",
        "total_bases": 858136816,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Arenicellales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970577",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462438",
        "total_bases": 683805151,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Thalassarchaeum sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970578",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462439",
        "total_bases": 1389481848,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970579",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462440",
        "total_bases": 982500161,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970581",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462441",
        "total_bases": 101897596,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Gammaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970582",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462442",
        "total_bases": 1106557598,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970583",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462443",
        "total_bases": 861848561,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970584",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462444",
        "total_bases": 993035530,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970585",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462445",
        "total_bases": 942490502,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970586",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462446",
        "total_bases": 891765519,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Alphaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970587",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462447",
        "total_bases": 849451268,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970588",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462448",
        "total_bases": 828476939,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pelagibacteraceae bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970589",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462449",
        "total_bases": 958042537,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970590",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462450",
        "total_bases": 1148102353,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Gammaproteobacteria bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970710",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462293",
        "total_bases": 1010729299,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Pseudothioglobus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970711",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462294",
        "total_bases": 956693407,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970712",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462295",
        "total_bases": 1424570978,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970713",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462296",
        "total_bases": 1235321808,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970714",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462297",
        "total_bases": 908807950,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Acidimicrobiales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970715",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462298",
        "total_bases": 1054478150,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Fidelibacterota bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970716",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462299",
        "total_bases": 892495112,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970717",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462300",
        "total_bases": 1603357014,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970718",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462322",
        "total_bases": 1293736505,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970719",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462323",
        "total_bases": 1468139365,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Fidelibacterota bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970720",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462324",
        "total_bases": 1180865662,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970721",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462325",
        "total_bases": 1201956938,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970722",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462326",
        "total_bases": 1052379453,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970723",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462327",
        "total_bases": 1090407680,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Woesearchaeota archaeon",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970724",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462328",
        "total_bases": 1168331725,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Candidatus Nitrosopelagicus sp.",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      },
      {
        "run_accession": "SRR37970725",
        "bioproject_accession": "PRJNA1259050",
        "biosample_accession": "SAMN48462329",
        "total_bases": 719329487,
        "platform": "ILLUMINA",
        "instrument_model": "NextSeq 2000",
        "library_strategy": "WGA",
        "organism": "Arenicellales bacterium",
        "center_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "institution_name": "BIGELOW LABORATORY FOR OCEAN SCIENCES",
        "geo_loc_name": null,
        "source": "NCBI",
        "year": 2026,
        "published_dt": "2026-09-04 10:07:20",
        "is_saudi_submitter": false,
        "is_pathogen": false,
        "is_wgs": false
      }
    ]
  }
};
