function toggleSidebar() {
  var sidebar = document.getElementById("sidebar");
  var content = document.getElementById("content");
  var topMenu = document.getElementById("top-menu");

  sidebar.classList.toggle("open");
  content.classList.toggle("open");
  topMenu.classList.toggle("open");
}

function load_data(hexString) {
  const GNSS_ID = {
    0: "GPS",
    1: "SBAS",
    2: "GALILEO",
    3: "BEIDOU",
    5: "QZSS",
    6: "GLONASS",
  };
  const BREIF = {
    GPS: "G",
    SBAS: "S",
    GALILEO: "E",
    BEIDOU: "B",
    QZSS: "Q",
    GLONASS: "R",
  };
  const FREKANS = {
    "0,0": ["L1C/A2", "rgba(255, 148, 148)"],
    "0,3": ["L2 CL", "rgba(54, 162, 235, 0.5)"],
    "0,4": ["L2 CM", "rgba(200, 200, 200)"],
    "1,0": ["L1C/A2", "rgba(255, 148, 148)"],
    "2,0": ["E1 C2", "rgba(255, 148, 148)"],
    "2,1": ["E1 B2", "rgba(54, 162, 235, 0.5)"],
    "2,5": ["E5 bl", "rgba(200, 200, 200)"],
    "2,6": ["E5 bQ", "rgba(255, 148, 148)"],
    "3,0": ["B1lD12", "rgba(255, 148, 148)"],
    "3,1": ["B1lD22", "rgba(54, 162, 235, 0.5)"],
    "3,2": ["B2lD1", "rgba(200, 200, 200)"],
    "3,3": ["B2lD2", "rgba(255, 148, 148)"],
    "5,0": ["L1C/A2", "rgba(255, 148, 148)"],
    "5,1": ["L1S", "rgba(54, 162, 235, 0.5)"],
    "5,4": ["L2 CM", "rgba(200, 200, 200)"],
    "5,5": ["l2 CL", "rgba(255, 148, 148)"],
    "6,0": ["L1 OF2", "rgba(255, 148, 148)"],
    "6,2": ["L2 OF", "rgba(54, 162, 235, 0.5)"],
  };

  const byteArray = hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16));
  const i = byteArray.map((byte) => "0x" + byte.toString(16).padStart(2, "0"));
  if (i[0] == 0xa4 && i[1] == 0x64) {
    if (i[2] == 0x0d && i[3] == 0x03) {
      var CK_A = 0;
      var CK_B = 0;
      const Buffer = i.slice(2, i.length - 2);
      for (let i = 0; i < Buffer.length; i++) {
        CK_A = (CK_A + Buffer[i]) & 0xff;
        CK_B = (CK_B + CK_A) & 0xff;
      }
      const year = [i[6], i[7]].reduce(
        (acc, byte, index) => acc + parseInt(byte, 16) * Math.pow(256, index)
      );
      const month = parseInt(i[8], 16);
      const day = parseInt(i[9], 16);
      const hour = parseInt(i[10], 16);
      const minute = parseInt(i[11], 16);
      const sec =
        [i[12], i[13]].reduce(
          (acc, byte, index) => acc + parseInt(byte, 16) * Math.pow(256, index)
        ) * 1e-3;
      const timemark = parseInt(i[14], 16);
      document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("date").innerText = year + "/" + month + "/" + day + " - " + hour + ":" + minute + ":" + sec;
        document.getElementById("timemartk").innerText = timemark;
      });
    } else if (i[2] == 0x01 && i[3] == 0x70) {
      var CK_A = 0;
      var CK_B = 0;
      const Buffer = i.slice(2, i.length - 2);
      for (let i = 0; i < Buffer.length; i++) {
        CK_A = (CK_A + Buffer[i]) & 0xff;
        CK_B = (CK_B + CK_A) & 0xff;
      }
      const length = parseInt(i[4].toString(16), 16);
      if (length != 0 && length % 2 == 0) {
        const satelite_n = (length - 20) / 4;
        if (satelite_n > 0) {
          const infos = i.slice(length - 14, i.length - 2);
          const satelite_information = i.slice(6, i.length - 2 - 20);
          const chart_data = {};
          for (let i = 0; i < satelite_information.length; i += 4) {
            const sub = satelite_information.slice(i, i + 4);
            let satelite = GNSS_ID[parseInt(sub[0], 16)];
            let satelite_identifier = parseInt(sub[1], 16);
            let signal_idenifier =
              FREKANS[`${parseInt(sub[0], 16)},${parseInt(sub[2], 16)}`];
            let strength = parseInt(sub[3], 16);
            if (chart_data[BREIF[satelite] + satelite_identifier] != undefined) {
              chart_data[BREIF[satelite] + satelite_identifier].push([
                strength,
                signal_idenifier[1],
              ]);
            } else {
              chart_data[BREIF[satelite] + satelite_identifier] = [
                [strength, signal_idenifier[1]],
              ];
            }
          }
          const data = {
            labels: Object.keys(chart_data),
            datasets: [],
          };
          const colors = [...new Set(Object.values(chart_data).map((a) => a[0][1]))];
          colors.forEach((color) => {
            const dataset = {
              label: '',
              backgroundColor: color,
              data: [],
            };

            Object.keys(chart_data).forEach((key) => {
              const value = chart_data[key].find((item) => item[1] === color);
              if (value) {
                dataset.data.push(value[0]);
              } else {
                dataset.data.push(0);
              }
            });

            data.datasets.push(dataset);
          });
          chart_config.data = data;
          setTimeout(() => {
            loaded_chart.update();
          },2000);
          const longitude =
            infos
              .slice(0, 4)
              .reduce(
                (acc, byte, index) =>
                  acc + parseInt(byte, 16) * Math.pow(256, index),
                0
              ) * 1e-7;
          const latitude =
            infos
              .slice(4, 8)
              .reduce(
                (acc, byte, index) =>
                  acc + parseInt(byte, 16) * Math.pow(256, index),
                0
              ) * 1e-7;
          const height_above =
            infos
              .slice(8, 12)
              .reduce(
                (acc, byte, index) =>
                  acc + parseInt(byte, 16) * Math.pow(256, index),
                0
              ) * 1e-3;
          const height_sea =
            infos
              .slice(12, 16)
              .reduce(
                (acc, byte, index) =>
                  acc + parseInt(byte, 16) * Math.pow(256, index),
                0
              ) * 1e-3;
          const fix_mode =
            parseInt(infos.slice(16, 20)[0], 16) == 0 ? "NOT Fixed" : "3D Fixed";
            document.getElementById("long").innerText = longitude.toFixed(7);
            document.getElementById("lat").innerText = latitude.toFixed(7);
            document.getElementById("height_above").innerText = height_above.toFixed(3);
            document.getElementById("height_sea").innerText = height_sea.toFixed(3);
            document.getElementById("fix").innerText = fix_mode;
        }
      }
    }
  }
}

const socketUrl = "ws://192.168.2.1/sattelite.inf";

let webSocket = new WebSocket(socketUrl);

webSocket.onopen = (event) => {
  console.log("opened")
};

webSocket.onmessage = (event) => {
  var reader = new FileReader();
  reader.onload = () => {
    var data = Array.from(new Uint8Array(reader.result)).map((d) => d.toString("16").padStart(2 ,'0')).join("");
    load_data(data)
  };
  reader.readAsArrayBuffer(event.data)
};

webSocket.onclose = (event) => {
  console.log("closed")
};

webSocket.onerror = (msg) => {
  console.log("Error :", msg);
};
