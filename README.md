# Zion Visualization Film and QR Code-Based Equipment History Management System

> Main Page Preview
> 

![./public/assets/mainView.png](./public/assets/mainView.png)

## 📌 Software Information

- **SW Registration Number:** C-2024-005406
- **Program Name:** Zion Visualization Film and QR Code-Based Equipment History Management System
- **Creation Date:** January 3, 2024
- **Registration Date:** February 8, 2024
- **Authors:** Handong Global University Industry-Academic Cooperation Foundation
- **Contributors:** Yoonmin Ko, Sohyeon Kim, Seokjae Ma
- **Application Type:** Application Software
- **Field of Application:** Industrial Equipment Management

## 🚀 Startup Settings

### Dependencies Setting Command Before Starting the Project

```bash
npm install # or yarn install
```

### Project Start Command

```bash
npm start # or yarn start
```

## 💻 Key Features

1. **User Account Encryption:** Utilizes bcrypt hashing function to safely store and verify user passwords, enhancing system security. 🔐
2. **Automatic Equipment Photography:** Uses Raspberry Pi and a camera module to periodically photograph equipment and upload these photos to the server for storage. 📷
3. **Temperature Detection and Overheating Check:** Analyzes the color of the Zion sticker in photos to determine specific temperatures and check for equipment overheating, with data automatically saved in the system. 🌡️
4. **Overheating Alerts:** Generates warnings when equipment is detected as overheated, allowing quick identification of equipment in a critical state. ⚠️
5. **Real-Time Equipment Status Updates:** Updates the home screen with real-time equipment status each time a temperature check is conducted, enabling immediate recognition of normal and abnormal conditions. 🔄
6. **Administrator Inspection Info Updates:** Displays the latest inspection information on the home screen as conducted by administrators, helping users stay informed about the most recent equipment conditions. 🛠️

## 📖 Usage Instructions

### 1. **Set up an AWS EC2 Instance:**

<img width=60% alt="AWS EC2 Setup" src="https://github.com/user-attachments/assets/5c8c7e78-40c9-4b72-8609-93468fd07d4e" />

- **Create an instance:** For example, name it CTA_Project.
- **Start and run the instance:** Follow the steps to initialize and access your instance.

### 2. **Activate Database:**

Execute the following command in the specified directory to start the database service.

```bash
# Execute in ~/WorkSpace/CTA_Web_Project/server folder
node server.js
```

### 3. **Start Web Service:**

To start the web service, use the command below:

```bash
# Execute in ~/WorkSpace/CTA_Web_Project/ folder
npm start
```

### 4. **Access via Browser:**

Access the service by navigating to: http://52.78.24.85:3000/

### 5. **Main Home Screen:**

<img width=70% alt="Main Home Screen" src="https://github.com/user-attachments/assets/2beea255-5ea6-4532-b425-e17ec2145142" />

- Register new equipment using the 'Add Equipment' button. 🆕

### 6. **Modify or Delete Equipment Information:**

<img width=70% alt="Edit Delete Equipment" src="https://github.com/user-attachments/assets/bb43ac1b-b2a1-46ae-b41b-351eeb6b31da" />

- Use the 'Edit' and 'Delete' buttons to modify or remove existing equipment entries. ✏️🗑️

### 7. **Manage Repair History and Check Equipment Status:**

<img width=70% alt="Equipment Status" src="https://github.com/user-attachments/assets/114bf568-a5cc-4645-8c0a-26835b4ed143" />

- Manage repair history and monitor equipment status, captured via Raspberry Pi camera module. 📋

### Additional Setup Instructions

- **AWS (Amazon Web Services):** Activate and configure AWS services.
- **Connect Server via Visual Studio Code:**
Visual Studio Code remote connection setup:
    - **Refer to this guide for remote connection methods and configurations.**
        - https://velog.io/@maasj/Mac-AWS%EC%99%80-VS-Code-%EC%9B%90%EA%B2%A9-%EC%A0%91%EC%86%8D-%EB%B0%A9%EB%B2%95
    - **Configure your VS Code as follows:**
      
      <img width=70% alt="VS Code Setup" src="https://github.com/user-attachments/assets/a133d359-49ef-4785-a338-fb1ca5d5f2c8" />

        - Host: CTAWeb
        - HostName: 52.78.24.85
        - User: ubuntu
        - IdentifyFile: Specify the location of your pem file on the executing computer.

## 👨‍💻 Developer Contact

- **Email:** maasj7514@gmail.com

## 📜 License

- **Type:** MIT License. More details [here](https://github.com/minimal-ui-kit/minimal.free/blob/main/LICENSE.md).
