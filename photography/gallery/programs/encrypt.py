import os, io
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes

# --- CONFIGURATION ---
USERNAME = "USERNAME"
PASSKEY = "PASSWORD"
direc = "C:/Users/alfie/Photography-Portfolio/photography/gallery/images/private/" + USERNAME
full_folder = direc + "/full"
thumb_folder = direc + "/thumb"
# ---------------------


def EncryptPhotos(folder):
    for filename in os.listdir(folder):
        if filename.lower().endswith(".jpg") or filename.lower().endswith(".jpeg") or filename.lower().endswith(".png"):
            dir = os.path.join(folder, filename)
            # Checks if the file has already been encrypted.
            encdir = dir.split(".", 1)[0] + ".enc"
            if os.path.exists(encdir):
                continue
            print(filename)
            
            # Creates the key and ivs from the user's password and a salt.
            salt = get_random_bytes(16)
            key = PBKDF2(PASSKEY.encode('utf-8'), salt, dkLen=32, count=15000, hmac_hash_module=SHA256)
            cipher = AES.new(key, AES.MODE_CBC)
            iv = cipher.iv
            
            # Encrypts the file using AES.
            with open(dir, 'rb') as f:
                plaintext = f.read()
            ciphertext = cipher.encrypt(pad(plaintext, AES.block_size))
            
            # Writes to the encrypted file.
            with open(encdir, 'wb') as f:
                f.write(salt)
                f.write(iv)
                f.write(ciphertext)

   
EncryptPhotos(full_folder)
EncryptPhotos(thumb_folder)