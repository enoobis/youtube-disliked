# youtube disliked

shows the videos you disliked on youtube.

manifest v3 · vanilla typescript · works in any chromium browser (chrome, edge, brave, opera, vivaldi, arc).

---

## quick start

```text
1. load → 2. id → 3. oauth → 4. paste → 5. reload
```

### 1. load the extension

extensions page → developer mode → **load unpacked** → pick `dist/youtube-disliked`.

| chrome  | `chrome://extensions` |
| ------- | --------------------- |
| edge    | `edge://extensions`   |
| brave   | `brave://extensions`  |
| opera   | `opera://extensions`  |

### 2. copy the extension id

it appears under the extension's name. 32 lowercase letters.

### 3. create an oauth client

open [console.cloud.google.com](https://console.cloud.google.com/) and follow along.

#### 3.1 create a new project

<img width="790" height="39" alt="enable youtube data api v3" src="https://github.com/user-attachments/assets/343915aa-7e98-476e-adc9-4781d9a9d0e0" />

<img width="561" height="233" alt="oauth consent screen" src="https://github.com/user-attachments/assets/a9487c6a-dbc1-4460-81a9-a97f58113dec" />

#### 3.2 enable **youtube data api v3**

`apis & services` → `library` → search → enable.

<img width="723" height="551" alt="image" src="https://github.com/user-attachments/assets/0645e01b-de7d-477d-88f0-49685f015a63" />



#### 3.3 configure the oauth consent screen

user type **external** → fill app name + your email → save.


#### 3.4 add yourself as a test user

`audience` → **add users** → your gmail.


#### 3.5 open credentials

`apis & services` → `credentials` → **create credentials** → **oauth client id**.


#### 3.6 application type **chrome extension** + paste extension id

paste the 32-character id from step 2 into the *application id* field.


#### 3.7 copy the resulting client id


### 4. paste into manifest

open `dist/youtube-disliked/manifest.json`, replace the placeholder in `oauth2.client_id`.

### 5. reload

hit ⟳ on the extension card. click the extension icon. sign in. done.

---

## build from source

```bash
npm install
npm run build
```

## license

mit
