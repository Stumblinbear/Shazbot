import requests
import json
import random
import os
import string
import urllib.request
from tempfile import NamedTemporaryFile


acabox_server = 'https://acapela-box.com/AcaBox'

headers = {"User-Agent":"Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"}
cookies = {}

class Voice:
    ella = {'id': 'ella22k', 'info': ''}
    emilio = {'id': 'emilioenglish22k', 'info': ''}
    josh = {'id': 'josh22k', 'info': ''}
    karren = {'id': 'karen22k', 'info': ''}
    kenny = {'id': 'kenny22k', 'info': ''}
    laura = {'id': 'laura22k', 'info': ''}
    nelly = {'id': 'nelly22k', 'info': ''}
    rod = {'id': 'rod22k', 'info': ''}
    ryan = {'id': 'ryan22k', 'info': ''}
    saul = {'id': 'saul22k', 'info': ''}
    scott = {'id': 'scott22k', 'info': ''}
    sharon = {'id': 'sharon22k', 'info': ''}
    tracy = {'id': 'tracy22k', 'info': ''}

    will = {'id': 'will22k', 'info': ''}
    badguy = {'id': 'willbadguy22k', 'info': ''}
    joe = {'id': 'willfromafar22k', 'info': ''}
    happy = {'id': 'willhappy22k', 'info': ''}
    sad = {'id': 'willsad22k', 'info': ''}
    close = {'id': 'willupclose22k', 'info': ''}

    thug = {'id': 'willlittlecreature22k', 'info': ''}
    daddy = {'id': 'willoldman22k', 'info': ''}
    nigga = {'id': 'micah22k', 'info': ''}
    bun = {'id': 'valeriaenglish22k', 'info': ''}

def login():
    global cookies
    r = requests.post(acabox_server + '/login.php', headers=headers, cookies=cookies,
            data={
                'login': '',
                'password': ''
            })
    cookies = r.cookies

def make_voice(voice, text, rate=0, shaping=0, tried_again=False):
    global cookies

    r = requests.post(acabox_server + '/dovaas.php', headers=headers, cookies=cookies,
            data={
                'text': '\\vct=%i\\ \\spd=%i\\ %s' % (shaping + 100, rate + 180, text),
                'voice': voice['id'],
                'listen': '1',
                'format': 'WAV',
                'codecMP3': '0',
                'spd': str(rate + 180),
                'vtc': str(shaping + 100),
                'byline': '0'
            })
    cookies = r.cookies

    if r.reason != 'OK':
        if r.reason == 'Forbidden' and not tried_again:
            login()
            return make_voice(voice, text, rate, shaping, True)
        return None
    return download_url(json.loads(r.content.decode('UTF-8-SIG'))['snd_url'])

def download_url(url):
    tempfile = os.path.join('/tmp/tmp_acpbox_%s.wav' % ''.join(random.choice(string.ascii_lowercase) for i in range(32)))

    response = urllib.request.urlopen(url)
    CHUNK = 16 * 1024
    with open(tempfile, 'wb') as f:
        while True:
            chunk = response.read(CHUNK)
            if not chunk:
                break
            f.write(chunk)

    return tempfile

if __name__ == '__main__':
    import sys

    print('Downloading')
    filename = make_voice(getattr(Voice, sys.argv[1]), ' '.join(sys.argv[2:]))
    print('Playing')
    os.system('play ' + filename) # mp3 needs libid3tag
    print('Removing')
    os.remove(filename)
