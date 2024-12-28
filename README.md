# **File-manager**

## **Command Line File System Utility**


The program is started by npm-script start in following way:

```bash
npm run start -- --username=your_username
```

This Node.js command-line utility provides essential file system operations:

Example: 
```bash
compress ../path/to/file.txt ../

cp ../file.txt C:/
```
_Note: Paths should be provided without quotes._


### **Navigation & Working Directory (nwd)**

- Go Up:
  ```bash
  up
  ```
- Go to Folder:
  ```bash
  cd path_to_directory
  ```
- List Files and Folders:
  ```bash
  ls
  ```

### **Basic File Operations**

- Read File:
  ```bash
  cat path_to_file
  ```
- Create Empty File:
  ```bash
  add new_file_name
  ```
- Rename File:
  ```bash
  rn path_to_file new_filename
  ```
- Copy File:
  ```bash
  cp path_to_file path_to_new_directory
  ```
- Move File:
  ```bash
  mv path_to_file path_to_new_directory
  ```
- Delete File:
  ```bash
  rm path_to_file
  ```

### **Operating System Info**

- Get EOL:
  ```bash
  os --EOL
  ```
- Get CPUs Info:
  ```bash
  os --cpus
  ```
- Get Home Directory:
  ```bash
  os --homedir
  ```
- Get System User Name:
  ```bash
  os --username
  ```
- Get CPU Architecture:
  ```bash
  os --architecture
  ```

### **Hash Calculation**

- Calculate Hash:
  ```bash
  hash path_to_file
  ```

### **Compression and Decompression**

- Compress File:
  ```bash
  compress path_to_file path_to_destination
  ```
- Decompress File:
  ```bash
  decompress path_to_file path_to_destination
  ```
