# =========================================================
# RELÓGIO FALANTE + CONTROLE DO CHROME
# FALA DE 25 EM 25 MINUTOS
# WINDOWS 11
# =========================================================

import os
import time
from datetime import datetime

import pygame

from pycaw.pycaw import AudioUtilities

# =========================================================
# PASTA DOS ÁUDIOS
# =========================================================

PASTA_AUDIO = r"C:\TIME BOSS\(taaqui.org) Horas feminino sem efeito"

# =========================================================
# INICIA PYGAME
# =========================================================

pygame.init()
pygame.mixer.init()

# =========================================================
# CONFIGURAÇÕES
# =========================================================

# Volume do Chrome durante a fala
VOLUME_CHROME_BAIXO = 0.1

# Volume normal do Chrome
VOLUME_CHROME_NORMAL = 0.5

# =========================================================
# CONTROLE DE VOLUME DO CHROME
# =========================================================

def volume_chrome(volume):

    sessions = AudioUtilities.GetAllSessions()

    for session in sessions:

        processo = session.Process

        if processo:

            nome = processo.name().lower()

            if "chrome" in nome:

                try:

                    session.SimpleAudioVolume.SetMasterVolume(
                        volume,
                        None
                    )

                    print(f"Chrome volume alterado: {volume}")

                except Exception as erro:

                    print(f"Erro Chrome: {erro}")

# =========================================================
# TOCAR ÁUDIO
# =========================================================

def tocar_audio(caminho):

    if os.path.exists(caminho):

        print(f"Tocando: {caminho}")

        pygame.mixer.music.load(caminho)

        # Volume do relógio em 100%
        pygame.mixer.music.set_volume(1.0)

        pygame.mixer.music.play()

        while pygame.mixer.music.get_busy():
            time.sleep(0.1)

    else:

        print(f"Arquivo não encontrado: {caminho}")

# =========================================================
# FALAR HORÁRIO
# =========================================================

def falar_hora():

    agora = datetime.now()

    hora = agora.strftime("%H")
    minuto = agora.strftime("%M")

    print("===================================")
    print(f"Horário atual: {hora}:{minuto}")
    print("===================================")

    # Abaixa Chrome
    volume_chrome(VOLUME_CHROME_BAIXO)

    time.sleep(0.5)

    # Arquivo hora
    arquivo_hora = os.path.join(
        PASTA_AUDIO,
        f"HRS{hora}.mp3"
    )

    # Arquivo minuto
    arquivo_minuto = os.path.join(
        PASTA_AUDIO,
        f"MIN{minuto}.mp3"
    )

    # Toca hora
    tocar_audio(arquivo_hora)

    time.sleep(0.3)

    # Toca minuto
    tocar_audio(arquivo_minuto)

    time.sleep(0.5)

    # Restaura Chrome
    volume_chrome(VOLUME_CHROME_NORMAL)

# =========================================================
# INÍCIO
# =========================================================

print("===================================")
print("RELÓGIO FALANTE INICIADO")
print("FALANDO DE 25 EM 25 MINUTOS")
print("===================================")

# Fala ao iniciar
falar_hora()

ultimo_minuto_falado = -1

# =========================================================
# LOOP PRINCIPAL
# =========================================================

while True:

    agora = datetime.now()

    minuto_atual = agora.minute

    # =====================================================
    # FALA A CADA 25 MINUTOS
    #
    # Exemplo:
    # 00
    # 25
    # 50
    # =====================================================

    if minuto_atual in [0, 25, 50]:

        if ultimo_minuto_falado != minuto_atual:

            falar_hora()

            ultimo_minuto_falado = minuto_atual

    time.sleep(5)