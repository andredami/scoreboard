# KISS scoreboard

This is a small and simple stupid scoreboard system that allows to track multiple heats of at most 3 contestants, their order and results.

It allows import\export from\to Excel and has a read-only auto-updating interface for reference.

## Disclaimer

This is a prototypal software and is not hardened against security threats nor guarantees performance in production environments. Use at your own risk.

The graphical interfaces are in *Italian*.

## Quick guide

*Scoreboard* is tested on Google Chrome browser.
Other modern browsers are supported but may still show some unexpected behaviors.

To use *scoreboard* you need a device to host it inside the network. All the devices that want to access *scoreboard* must be connected to that network.

To connect to *scoreboard*, you need to know the IP address of the host serving it. Let's suppose it is `192.168.1.2`.

There are 2 interfaces:

1. **Administrator**: (http://192.168.1.2:3000/admin) allows to import\edit\export the scoreboard;
2. **Viewer**: (accessible at: http://192.168.1.2:3000) shows the scoreboard as imported\edited from the *Administrator interface*, with automatic live updates;

**WARNING**: the access to *Administrator interface* is not authenticated and the transmitted data are not validated or otherwise protected.

### Administrator interface

The *Administrator interface* allows to:

- Add a new heat to the scoreboard (input the data in the last row and select the `+` button);
- Edit a heat in the scoreboard (select the `pencil` button among the actions available for each row, perform the edit, select the `tick` button to save the edit);
- Edit the heat order (find the row to move one step above or below and select the corresponding `arrow` button among the actions of that row);
- Set a head as "current" (select the `running main` button at the beginning of the row you want to set as "current", this will be highlighted in green in both the *administrator interface* and the *viewer interface*);
- Export the scoreboard to an Excel file (select `Esporta tutta la griglia` and the download will start automatically);
- Clear the scoreboard, **LOOSING ALL ITS CONTENT** (select `Pulisci griglia` and confirm);
- *Only if the scoreboard is empty*, import a new scoreboard from an Excel file (select `browse`, pick a suitable Excel, confirm);
  - The Excel file will be imported inserting:
    - The first 3 columns (A, B, C) of the first spreadsheet as `Partecipante 1`, `Partecipante 2`, `Partecipante 3`
    - The following 3 columns (D, E, F) of the first spreadsheed as `Risultato 1`, `Risultato 2`, `Risultato 3`(these columns may be left blank)
    - All the other cells will be ignored

**WARNING**: Using multiple *Administrator interface* simultaneously can lead to database corruption!

## How to deploy on a RaspberryPi

The project can be easily deployed as server on a RaspberryPi.

### 0. Install [`n`](https://github.com/tj/n) - `node.js` version manager

*If you already have root-accessible node installation, skip this step.*

`n` allows to have better `node.js` version management throughout the system.

```bash
sudo -s
cd
git clone https://github.com/tj/n.git
cd n/
make install
cd ..
rm -Rf n
n latest
exit
```

### 1. Download the repository as `.zip` archive

*Or clone the repository, if you wish*

Obtain the source code for the project.

### 2. Uncompress the content of the archive (or copy the cloned repository) in the `/opt/scoreboard` folder

```bash
sudo -s
cd /opt
unzip /path/to/the/archive/named/scoreboard.zip
exit
```

### 3. Transfer the folder's ownership to `pi:pi`

```bash
sudo chown -R pi:pi /opt/scoreboard
```

### 4. Install all the dependencies (needs an internet connection)

```bash
cd /opt/scoreboard
npm install
npm rebuild
```

### 5. Start the service at boot

```bash
sudo useradd scoreboard
sudo chown -R scoreboard:scoreboard /opt/scoreboard
sudo cp /path/to/service/descr/scoreboard /etc/init.d/scoreboard
sudo chmod 755 /etc/init.d/scoreboard
sudo update-rc.d scoreboard defaults
```

### 6. Reboot

```bash
sudo reboot now
```
