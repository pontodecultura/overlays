import cv2
import numpy as np

# Inicializa a câmera
cap = cv2.VideoCapture(0)

# Verifica se a câmera abriu corretamente
if not cap.isOpened():
    print("Erro ao acessar a câmera.")
    exit()

# Cor verde (BGR)
GREEN = (0, 255, 0)

# Espessura das linhas
THICKNESS = 1

while True:
    ret, frame = cap.read()

    if not ret:
        print("Erro ao capturar frame.")
        break

    # Dimensões da tela
    height, width = frame.shape[:2]

    # Centro da tela
    center_x = width // 2
    center_y = height // 2

    # =========================
    # LINHAS CENTRAIS
    # =========================

    # Linha vertical central
    cv2.line(frame, (center_x, 0), (center_x, height), GREEN, THICKNESS)

    # Linha horizontal central
    cv2.line(frame, (0, center_y), (width, center_y), GREEN, THICKNESS)

    # =========================
    # MARGENS / BORDAS
    # =========================

    margin_x = int(width * 0.15)
    margin_y = int(height * 0.15)

    # Borda esquerda
    cv2.line(frame, (margin_x, 0), (margin_x, height), GREEN, THICKNESS)

    # Borda direita
    cv2.line(frame, (width - margin_x, 0), (width - margin_x, height), GREEN, THICKNESS)

    # Borda superior
    cv2.line(frame, (0, margin_y), (width, margin_y), GREEN, THICKNESS)

    # Borda inferior
    cv2.line(frame, (0, height - margin_y), (width, height - margin_y), GREEN, THICKNESS)

    # =========================
    # RETÍCULO CENTRAL
    # =========================

    reticle_size = 40

    # Horizontal
    cv2.line(
        frame,
        (center_x - reticle_size, center_y),
        (center_x + reticle_size, center_y),
        GREEN,
        THICKNESS
    )

    # Vertical
    cv2.line(
        frame,
        (center_x, center_y - reticle_size),
        (center_x, center_y + reticle_size),
        GREEN,
        THICKNESS
    )

    # Texto informativo
    cv2.putText(
        frame,
        "ENQUADRANDO A CAMERA",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        GREEN,
        2
    )

    # Exibe a janela
    cv2.imshow("Enquadramento de Camera", frame)

    # Tecla ESC para sair
    key = cv2.waitKey(1)

    if key == 27:
        break

# Libera recursos
cap.release()
cv2.destroyAllWindows()