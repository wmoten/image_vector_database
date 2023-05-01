@echo off

REM Create a virtual environment
python -m venv venv

REM Activate the virtual environment
.\venv\Scripts\activate

REM Upgrade pip
python -m pip install --upgrade pip

REM Install the required Python packages
pip install numpy sklearn torch torchvision efficientnet_pytorch annoy flask

echo All done!
pause
