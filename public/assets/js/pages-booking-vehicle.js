/**
 * Page Booking Vehicle
 */

'use strict';

$(function () {
  const timeBooking = document.querySelector('#timeBooking');
  const formBookingVehicle = $('.formBookingVehicle');
  const select2 = $('.select2');
  let dataVehicle = [];

  const vehicleTypes = {
    'Sedan': 'Sedan',
    'MPV': 'MPV', 
    'SUV': 'SUV',
    'Pick-up': 'Pick-up',
    'Box-truck': 'Box-truck'
  };

  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>').select2({
        dropdownParent: $this.parent(),
        placeholder: $this.data('placeholder'), // for dynamic placeholder
        dropdownCss: {
          minWidth: '150px' // set a minimum width for the dropdown
        }
      });
    });
    $('.select2-selection__rendered').addClass('w-px-150');
  }

  if (typeof timeBooking != undefined) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    timeBooking.flatpickr({
      mode: 'range',
      minDate: tomorrow,
      disable: [
        function(date) {
          // Disable tanggal hari ini dan sebelumnya
          return date <= new Date();
        }
      ],
      onChange: function(selectedDates, dateStr, instance) {
        if (selectedDates.length === 2) {
          const startDate = selectedDates[0];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const diffTime = startDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 1) {
            instance.clear();
            Swal.fire({
              title: 'Tidak dapat melakukan pemesanan!',
              text: 'Pemesanan harus dilakukan minimal 1 hari sebelumnya',
              icon: 'warning',
              customClass: {
                confirmButton: 'btn btn-primary waves-effect waves-light'
              },
              buttonsStyling: false
            });
          }
        }
      }
    });
  }

  loadVehicles();
  loadDrivers();
  loadApprovers();

  $(document).on('click', '.btn-booked', function () {
    let idVehicle = $(this).data('id');
    showFormBookedVehicle(idVehicle);
  });

  $(document).on('change', '#selectTypeVehicle', function () {
    let type = $(this).val();
    renderVehicle(type);
  });

  function updateRealTimeClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    $('#realTimeClock').text(`${hours}:${minutes}:${seconds}`);
  }

  setInterval(updateRealTimeClock, 1000);
  updateRealTimeClock();

  function isWorkingHours() {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 8 && hours < 17;
  }

  formBookingVehicle.submit(function (e) {
    e.preventDefault();
    
    if (!isWorkingHours()) {
      Swal.fire({
        title: 'Tidak dapat melakukan pemesanan!',
        text: 'Pemesanan hanya dapat dilakukan pada jam kerja (08:00 - 17:00)',
        icon: 'warning',
        customClass: {
          confirmButton: 'btn btn-primary waves-effect waves-light'
        },
        buttonsStyling: false
      });
      return;
    }

    formBookingVehicle.block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: '/api/bookings',
      type: 'POST',
      data: $(this).serialize(),
      success: function (d) {
        loadVehicles();
        formBookingVehicle.unblock();
        $('#modalBookingVehicle').modal('hide');
        Swal.fire({ title: 'Selamat!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      error: function (e) {
        formBookingVehicle.unblock();
        let msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'Terjadi kesalahan saat membuat pemesanan', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      }
    });
  });

  function loadVehicles() {
    $.get('/api/vehicles', function (data) {
      dataVehicle = data;
      $('.descVehicle').html(`Total ada ${data.length} kendaraan yang tersedia`);
      renderVehicle('all');
    });
  }

  function renderVehicle(type) {
    let filteredVehicle;
    if (type !== 'all') {
      filteredVehicle = dataVehicle.filter(vehicle => vehicle.type === type);
    } else {
      filteredVehicle = dataVehicle;
    }

    const status = {
      available: { title: 'Tersedia', class: 'success', icon: 'check' },
      maintenance: { title: 'Perbaikan', class: 'warning', icon: 'x' }
    };

    if (filteredVehicle.length) {
      $('#listVehicles').html('');
      filteredVehicle.forEach(vehicle => {
        const bookingButton = vehicle.status === 'maintenance' 
          ? `<button class="app-academy-md-50 btn btn-label-warning d-flex align-items-center" onclick="alertMaintenance()">
              <span class="me-2">Pesan</span><i class="ti ti-shopping-cart-up ti-sm"></i>
             </button>`
          : `<button class="app-academy-md-50 btn btn-label-primary d-flex align-items-center btn-booked" data-id="${vehicle._id}">
              <span class="me-2">Pesan</span><i class="ti ti-shopping-cart-up ti-sm"></i>
             </button>`;

        $('#listVehicles').append(`<div class="col-sm-6 col-lg-4">
          <div class="card p-2 h-100 shadow-none border">
            <div class="card-body p-3 pt-2">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-label-primary">${vehicleTypes[vehicle.type] || vehicle.type}</span>
                <span class="badge bg-label-secondary">${vehicle.licensePlate}</span>
              </div>
              <h5>${vehicle.name}</h5>
              <p class="mt-2">${vehicle.description}</p>
              <p class="d-flex align-items-center text-${status[vehicle.status].class}">
                <i class="ti ti-${status[vehicle.status].icon} me-2 mt-n1"></i>${status[vehicle.status].title}
              </p>
              <div class="d-flex flex-column flex-md-row gap-2 text-nowrap">
                ${bookingButton}
              </div>
            </div>
          </div>
        </div>`);
      });
    }
  }

  function loadDrivers() {
    $.get('/api/drivers', function (data) {
      data.forEach(driver => {
        $('#listDrivers').append(`<option value="${driver._id}">${driver.name}</option>`);
      });
    });
  }

  function loadApprovers() {
    $.get('/api/approvers', function (data) {
      data.forEach(approver => {
        $('#listApprovers').append(`<option value="${approver._id}">${approver.username}</option>`);
      });
    });
  }

  function showFormBookedVehicle(id) {
    $('#vehicleId').val(id);
    $('#modalBookingVehicle').modal('show');
  }

  // Tambahkan fungsi untuk menampilkan alert
  function alertMaintenance() {
    Swal.fire({
      title: 'Tidak Tersedia!',
      text: 'Kendaraan sedang dalam perbaikan',
      icon: 'warning',
      customClass: {
        confirmButton: 'btn btn-primary waves-effect waves-light'
      },
      buttonsStyling: false
    });
  }
});
