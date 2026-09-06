// Generated snapshot of the aggregate endpoints, harvested from the
// production D1 database. Served by fallback.ts when the D1 daily read
// quota is exhausted so the dashboard keeps working on stale-but-real data.
// Regenerate after each daily sync (see /tmp/harvest.log workflow).

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
  }
};
