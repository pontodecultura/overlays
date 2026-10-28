import cv2
import numpy as np
import os
import time

# ==========================================
# CONFIGURAÇÕES
# ==========================================

REFERENCE_IMAGE = "referencia.jpg"

GREEN = (0, 255, 0)
RED = (0, 0, 255)
WHITE = (255, 255, 255)

THICKNESS = 2

# Quantidade mínima de matches
MATCH_THRESHOLD = 40

# ==========================================
# INICIALIZA CÂMERA
# ==========================================

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Erro ao acessar câmera.")
    exit()

# Resolução HD
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# ==========================================
# ORB DETECTOR
# ==========================================

orb = cv2.ORB_create(1500)

bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

# ==========================================
# FPS
# ==========================================

prev_time = 0

# ==========================================
# REFERÊNCIA
# ==========================================

reference = None
reference_gray = None
kp1 = None
des1 = None

# ==========================================
# CARREGAR REFERÊNCIA
# ==========================================

def load_reference():

    global reference
    global reference_gray
    global kp1
    global des1

    if not os.path.exists(REFERENCE_IMAGE):
        print("Nenhuma referência encontrada.")
        return False

    reference = cv2.imread(REFERENCE_IMAGE)

    if reference is None:
        print("Erro ao carregar referência.")
        return False

    reference_gray = cv2.cvtColor(reference, cv2.COLOR_BGR2GRAY)

    kp1, des1 = orb.detectAndCompute(reference_gray, None)

    print("Referência carregada.")

    return True


# Tenta carregar referência ao iniciar
reference_loaded = load_reference()

# ==========================================
# LOOP PRINCIPAL
# ==========================================

while True:

    ret, frame = cap.read()

    if not ret:
        print("Erro ao capturar frame.")
        break

    # ==========================================
    # DIMENSÕES
    # ==========================================

    height, width = frame.shape[:2]

    center_x = width // 2
    center_y = height // 2

    # ==========================================
    # FPS
    # ==========================================

    current_time = time.time()

    fps = 0

    if prev_time != 0:
        fps = 1 / (current_time - prev_time)

    prev_time = current_time

    # ==========================================
    # STATUS
    # ==========================================

    aligned = False
    matches_count = 0

    # ==========================================
    # COMPARAÇÃO COM REFERÊNCIA
    # ==========================================

    if reference_loaded:

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        kp2, des2 = orb.detectAndCompute(gray, None)

        if des2 is not None and des1 is not None:

            matches = bf.match(des1, des2)

            matches = sorted(matches, key=lambda x: x.distance)

            good_matches = matches[:80]

            matches_count = len(good_matches)

            if matches_count > MATCH_THRESHOLD:
                aligned = True

    # ==========================================
    # CORES
    # ==========================================

    if aligned:
        color = GREEN
        status = "ENQUADRAMENTO OK"
    else:
        color = RED
        status = "AJUSTE A CAMERA"

    # ==========================================
    # LINHAS CENTRAIS
    # ==========================================

    cv2.line(
        frame,
        (center_x, 0),
        (center_x, height),
        color,
        THICKNESS
    )

    cv2.line(
        frame,
        (0, center_y),
        (width, center_y),
        color,
        THICKNESS
    )

    # ==========================================
    # REGRA DOS TERÇOS
    # ==========================================

    third_x1 = width // 3
    third_x2 = 2 * width // 3

    third_y1 = height // 3
    third_y2 = 2 * height // 3

    cv2.line(frame, (third_x1, 0), (third_x1, height), color, 1)
    cv2.line(frame, (third_x2, 0), (third_x2, height), color, 1)

    cv2.line(frame, (0, third_y1), (width, third_y1), color, 1)
    cv2.line(frame, (0, third_y2), (width, third_y2), color, 1)

    # ==========================================
    # SAFE AREA
    # ==========================================

    margin_x = int(width * 0.10)
    margin_y = int(height * 0.10)

    cv2.rectangle(
        frame,
        (margin_x, margin_y),
        (width - margin_x, height - margin_y),
        color,
        1
    )

    # ==========================================
    # RETÍCULO CENTRAL
    # ==========================================

    reticle_size = 50

    cv2.line(
        frame,
        (center_x - reticle_size, center_y),
        (center_x + reticle_size, center_y),
        color,
        THICKNESS
    )

    cv2.line(
        frame,
        (center_x, center_y - reticle_size),
        (center_x, center_y + reticle_size),
        color,
        THICKNESS
    )

    # Círculo central
    cv2.circle(
        frame,
        (center_x, center_y),
        80,
        color,
        1
    )

    # ==========================================
    # REC
    # ==========================================

    cv2.circle(frame, (width - 50, 40), 10, RED, -1)

    cv2.putText(
        frame,
        "REC",
        (width - 110, 48),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        RED,
        2
    )

    # ==========================================
    # TEXTO STATUS
    # ==========================================

    cv2.putText(
        frame,
        status,
        (20, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        color,
        3
    )

    # ==========================================
    # MATCHES
    # ==========================================

    cv2.putText(
        frame,
        f"Matches: {matches_count}",
        (20, 100),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        WHITE,
        2
    )

    # ==========================================
    # FPS
    # ==========================================

    cv2.putText(
        frame,
        f"FPS: {int(fps)}",
        (20, 140),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        WHITE,
        2
    )

    # ==========================================
    # RESOLUÇÃO
    # ==========================================

    cv2.putText(
        frame,
        f"{width}x{height}",
        (20, height - 20),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        WHITE,
        2
    )

    # ==========================================
    # INSTRUÇÕES
    # ==========================================

    cv2.putText(
        frame,
        "S = SALVAR REFERENCIA",
        (width - 350, height - 60),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        WHITE,
        2
    )

    cv2.putText(
        frame,
        "ESC = SAIR",
        (width - 350, height - 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        WHITE,
        2
    )

    # ==========================================
    # EXIBE
    # ==========================================

    cv2.imshow("AUTO ENQUADRAMENTO INTELIGENTE", frame)

    # ==========================================
    # TECLAS
    # ==========================================

    key = cv2.waitKey(1)

    # ESC
    if key == 27:
        break

    # SALVAR REFERÊNCIA
    if key == ord('s'):

        cv2.imwrite(REFERENCE_IMAGE, frame)

        print("Referência salva.")

        reference_loaded = load_reference()

# ==========================================
# FINALIZA
# ==========================================

cap.release()

cv2.destroyAllWindows()