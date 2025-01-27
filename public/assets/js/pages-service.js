$(document).ready(function() {
  const formAddService = $('.formAddService');
  
  // Initialize flatpickr
  if ($('#serviceTime').length) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    $('#serviceTime').flatpickr({
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
              title: 'Tidak dapat melakukan service!',
              text: 'Service harus dijadwalkan minimal 1 hari sebelumnya',
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
  loadServices();

  formAddService.submit(function(e) {
    e.preventDefault();
    formAddService.block({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 }
    });

    const formData = $(this).serialize();
    
    $.ajax({
      url: '/u/api/services',
      type: 'POST',
      data: formData,
      success: function(response) {
        loadServices();
        formAddService.unblock();
        formAddService[0].reset();
        $('#modalAddService').modal('hide');
        Swal.fire({
          title: 'Berhasil!',
          text: response.msg,
          icon: 'success',
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        });
      },
      error: function(error) {
        formAddService.unblock();
        Swal.fire({
          title: 'Gagal!',
          text: error.responseJSON?.msg || 'Terjadi kesalahan',
          icon: 'error',
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        });
      }
    });
  });

  $(document).on('click', '.complete-service', function() {
    const serviceId = $(this).data('id');
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah service sudah selesai?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
      customClass: {
        confirmButton: 'btn btn-primary me-3',
        cancelButton: 'btn btn-label-secondary'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        completeService(serviceId);
      }
    });
  });

  function loadVehicles() {
    $.get('/api/vehicles', function(vehicles) {
      $('#vehicleId').empty().append('<option value="">Pilih kendaraan</option>');
      
      vehicles.forEach(vehicle => {
        // Hanya tampilkan kendaraan yang tersedia (tidak sedang dalam maintenance)
        if (vehicle.status === 'available') {
          $('#vehicleId').append(`
            <option value="${vehicle._id}">
              ${vehicle.name} (${vehicle.licensePlate})
            </option>
          `);
        }
      });
    });
  }

  function loadServices() {
    $('#listServices').empty();
    $('.card').block({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 }
    });

    $.get('/api/services', function(services) {
      $('.card').unblock();
      services.forEach(service => {
        const startDate = new Date(service.startDate).toLocaleDateString('id-ID');
        const endDate = new Date(service.endDate).toLocaleDateString('id-ID');
        const status = service.status === 'completed' ? 
          '<span class="badge bg-label-success">Selesai</span>' : 
          '<span class="badge bg-label-warning">Dalam Proses</span>';
        
        const actionButton = service.status === 'completed' ? 
          '' : 
          `<button class="btn btn-sm btn-success complete-service" data-id="${service._id}">
             <i class="ti ti-check me-1"></i>Selesai
           </button>`;

        $('#listServices').append(`
          <tr>
            <td>${service.vehicle.name} - ${service.vehicle.licensePlate}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>${service.description}</td>
            <td>${status}</td>
            <td>${actionButton}</td>
          </tr>
        `);
      });
    });
  }

  function completeService(serviceId) {
    $.ajax({
      url: `/api/services/${serviceId}/complete`,
      type: 'PUT',
      success: function(response) {
        loadServices();
        Swal.fire({
          title: 'Berhasil!',
          text: response.msg,
          icon: 'success',
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        });
      },
      error: function(error) {
        Swal.fire({
          title: 'Gagal!',
          text: error.responseJSON?.msg || 'Terjadi kesalahan',
          icon: 'error',
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        });
      }
    });
  }
}); 