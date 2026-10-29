# software_engineering_project

# Requirements

```
Python 3.9+
Pip 26.x
Flask 3.1.3
```

# How to Setup

## Windows

<details>

1. Setup the Virtual Environment
```
python3 -m .venv venv
```

2. Change to your venv directory
```
cd .venv
```

3. install flask using pip
```
pip install flask
```

4. Run the App
```
flask --app music_suggester_api run --debug
```
</details>

## Mac/Linux

<details>

1. Setup Virtual Environment
```
python3 -m .venv venv
```

2. Activate Virtual Environment
``` 
source .venv/bin/activate.sh
```

**or**

You might need to use a different activation file depending on OS

``` 
source .venv/bin/activate.[script file extension here]
```

3. Install flask using pip
```
pip install flask
```

4. Run the App
```
flask --app music_suggester_api run --debug
```
</details>
