fetch("artist_data.json")
  .then((response) => response.json())
  .then((data) => {
    const labels = data.map((entry) => entry.artist);

    const datasets = data.map((entry) => ({
      label: [],
      data: [
        { x: entry.albums[0].year, y: entry.albums[0].streams },
        { x: entry.albums[1].year, y: entry.albums[1].streams },
      ],
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 8,
      album1CoverUrl: entry.albums[0].album_cover,
      album2CoverUrl: entry.albums[1].album_cover,
      gapYears: entry.gap_years,
      streamsDifference: entry.albums[1].streams - entry.albums[0].streams,
      borderColor: (entry.albums[1].streams - entry.albums[0].streams) >= 0 
        ? 'green'
        : (entry.albums[1].streams - entry.albums[0].streams) < 0
          ? 'red'
          : 'grey',
      pointBackgroundColor: (entry.albums[1].streams - entry.albums[0].streams) >= 0 
        ? 'green'
        : (entry.albums[1].streams - entry.albums[0].streams) < 0
          ? 'red'
          : 'grey',
      pointBorderColor: (entry.albums[1].streams - entry.albums[0].streams) >= 0 
        ? 'green'
        : (entry.albums[1].streams - entry.albums[0].streams) < 0
          ? 'red'
          : 'grey',
    }));

    const ctx = document.getElementById("myChart").getContext("2d");

    const myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
            layout: {
              padding: {
                top: 55, 
                right: 35,
                bottom: 0,
                left: 0,
              },
            },
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              title: {
                display: true,
                text: "Year",
                font: {
                  weight: "bold",
                  size: 23,
                },
                padding: {
                    top: 30, 
                  },
              },
              ticks: {
                stepSize: 1, 
                callback: function(value, index, values) {
                  return value.toString(); 
                }
              }
            },
            y: {
              type: "linear",
              min: 0,
              ticks: {
                stepSize: 100000, 
              },
              title: {
                display: true,
                text: "Streams",
                font: {
                  weight: "bold",
                  size: 23,
                },
                padding: {
                    bottom: 30,
                  },
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: false,
            },
          },
          interaction: {
            mode: "point", 
            intersect: true,
          },
        },
      });

    
    myChart.canvas.addEventListener("click", function (evt) {
      console.log("Plot clicked!");
      const activePoint = myChart.getElementsAtEventForMode(evt, "point", myChart.options);
      if (activePoint.length > 0) {
        const datasetIndex = activePoint[0].datasetIndex;
        const index = activePoint[0].index;
        openModal(datasetIndex, data, datasets);
      }
    });

    const labelsContainer = document.getElementById("labels");
    labels.forEach((label, index) => {
      const labelElement = document.createElement("div");
      labelElement.classList.add("label");
      labelElement.textContent = label;
      let timeoutId;
      labelElement.addEventListener("mouseenter", () => {
        timeoutId = setTimeout(() => {
          labelElement.classList.add("active");
          myChart.data.datasets[index].borderWidth = 5;
          myChart.update();
        }, 500);
      });
      labelElement.addEventListener("mouseleave", () => {
        clearTimeout(timeoutId);
        labelElement.classList.remove("active");
        myChart.data.datasets[index].borderWidth = 1;
        myChart.update();
      });
      labelElement.addEventListener("click", () => {
        openModal(index, data, datasets);
      });
      labelsContainer.appendChild(labelElement);
    });

    document
      .getElementById("gapYearsFilter")
      .addEventListener("change", function (evt) {
        const selectedGapYears = evt.target.value;
        filterGraphByGapYears(selectedGapYears, myChart, datasets, labels, labelsContainer);
      });

    document
      .getElementById("streamsDifferenceFilter")
      .addEventListener("change", function (evt) {
        const selectedStreamsDifference = evt.target.value;
        filterGraphByStreamsDifference(selectedStreamsDifference, myChart, datasets, labels, labelsContainer);
      });
  
 
  });


function openModal(datasetIndex, data, datasets) {
  const album1CoverUrl = data[datasetIndex].albums[0].album_cover;
  const album2CoverUrl = data[datasetIndex].albums[1].album_cover;
  const gapYears = datasets[datasetIndex].gapYears;
  const artistName = data[datasetIndex].artist;
  const album1Name = data[datasetIndex].albums[0].name;
  const album1Year = data[datasetIndex].albums[0].year;
  const album1Streams = data[datasetIndex].albums[0].streams;
  const album2Name = data[datasetIndex].albums[1].name;
  const album2Year = data[datasetIndex].albums[1].year;
  const album2Streams = data[datasetIndex].albums[1].streams;
  const streamsDifference = album2Streams - album1Streams;
  const streamsDifferenceAbs = Math.abs(streamsDifference);
  const salesDescription =
    streamsDifference > 0
      ? `Sales increased by ${streamsDifferenceAbs} streams from the first album to the second album.`
      : streamsDifference < 0
      ? `Sales decreased by ${streamsDifferenceAbs} streams from the first album to the second album.`
      : `Sales remained the same between the two albums.`;

  const modalContent = `
<div>
  <h3>${artistName}</h3>
  <div class="album-info">
    <div class="album-info-right">
      <img src="${album1CoverUrl}" alt="${album1Name}" style="width: 150px; height: 150px;"/>
      <p>${album1Name} (${album1Year})</p>
      <p>Streams: ${album1Streams}</p>
    </div>
    <div class="album-info-left">
      <img src="${album2CoverUrl}" alt="${album2Name}" style="width: 150px; height: 150px;"/>
      <p>${album2Name} (${album2Year})</p>
      <p>Streams: ${album2Streams}</p>
    </div>
  </div>
  <p>Gap (Years): ${gapYears}</p>
  <p>${salesDescription}</p>
</div>
`;

  const modal = document.getElementById("myModal");
  const modalContentDiv = document.getElementById("modalContent");
  modalContentDiv.innerHTML = modalContent;
  modal.style.display = "block";

  const closeBtn = document.getElementsByClassName("close")[0];
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

function filterGraphByGapYears(selectedGapYears, chart, datasets, labels, labelsContainer) {
  chart.data.datasets.forEach((dataset, index) => {
    if (
      selectedGapYears === "all" ||
      dataset.gapYears == selectedGapYears
    ) {
      dataset.hidden = false;
      dataset.data.forEach((point) => {
        point.hidden = false;
      });
      labelsContainer.children[index].style.color = 'black';
    } else {
      dataset.hidden = true;
      dataset.data.forEach((point) => {
        point.hidden = true;
      });
      labelsContainer.children[index].style.color = 'lightgrey';
    }
  });
  chart.update();
}