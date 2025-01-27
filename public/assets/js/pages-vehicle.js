$(document).ready(function () {
  const formAddVehicle = $('.formAddVehicle');
  const formEditVehicle = $('.formEditVehicle');
  let idVehicle;

  loadVehicles();

  $(document).on('click', '.vehicle-delete', function () {
    let idVehicle = $(this).data('id');
    Swal.fire({ text: 'Apakah anda yakin ingin menghapus kendaraan ini?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light', cancelButton: 'btn btn-outline-danger ms-2 waves-effect waves-light' }, buttonsStyling: false }).then(function (result) {
      if (result.value) {
        deleteVehicle(idVehicle);
      }
    });
  });

  $(document).on('click', '.vehicle-edit', function () {
    let idVehicle = $(this).data('id');
    showModalEditVehicle(idVehicle);
  });

  formAddVehicle.submit(function (e) {
    e.preventDefault();
    formAddVehicle.block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: '/api/vehicles',
      type: 'POST',
      data: $(this).serialize(),
      success: function (d) {
        loadVehicles();
        formAddVehicle.unblock();
        formAddVehicle[0].reset();
        $('#modalAddVehicle').modal('hide');
        Swal.fire({ title: 'Berhasil!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      error: function (e) {
        formAddVehicle.unblock();
        let msg = e.responseJSON?.msg || 'Terjadi kesalahan pada tipe kendaraan';
        Swal.fire({ title: 'Gagal!', text: msg, icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      }
    });
  });

  formEditVehicle.submit(function (e) {
    e.preventDefault();
    formEditVehicle.block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: '/api/vehicles/' + idVehicle,
      type: 'PUT',
      data: $(this).serialize(),
      success: function (d) {
        loadVehicles();
        formEditVehicle.unblock();
        formEditVehicle[0].reset();
        $('#modalEditVehicle').modal('hide');
        Swal.fire({ title: 'Selamat!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      error: function (e) {
        formEditVehicle.unblock();
        let msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      }
    });
  });

  function loadVehicles() {
    $('#listVehicles').html('');
    $('.card-table').block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });

    $.get('/api/vehicles', function (data) {
      $('.card-table').unblock();

      data.forEach(vehicle => {
        $('#listVehicles').append(`<tr>
          <td>${vehicle.name}</td>
          <td>${vehicle.type}</td>
          <td>${vehicle.licensePlate}</td>
          <td><span class="badge bg-label-${vehicle.status === 'available' ? 'success' : 'warning'} me-1">${vehicle.status === 'maintenance' ? 'Perbaikan' : 'Tersedia'}</span></td>
          <td>${new Date(vehicle.createdAt).toLocaleDateString()}</td>
          <td>
            <div class="dropdown">
              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical"></i></button>
              <div class="dropdown-menu">
                <a class="dropdown-item vehicle-edit" data-id="${vehicle._id}" ><i class="ti ti-pencil me-1"></i> Edit</a>
                <a class="dropdown-item vehicle-delete" data-id="${vehicle._id}" ><i class="ti ti-trash me-1"></i> Delete</a>
              </div>
            </div>
          </td>
        </tr>`);
      });
    });
  }

  function showModalEditVehicle(id) {
    $.blockUI({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: '/api/vehicles/' + id,
      type: 'GET',
      success: function (d) {
        $.unblockUI();
        idVehicle = id;
        $('#editName').val(d.name);
        $('#editLicensePlate').val(d.licensePlate);
        $('#editType').val(d.type);
        $('#editStatus').val(d.status);
        $('#editDescription').val(d.description);
        $('#modalEditVehicle').modal('show');
      },
      error: function (e) {
        $.unblockUI();
        let msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      }
    });
  }

  function deleteVehicle(id) {
    $.ajax({
      url: '/api/vehicles/' + id,
      type: 'DELETE',
      success: function (d) {
        loadVehicles();
        Swal.fire({ title: 'Selamat!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      error: function (e) {
        let msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      }
    });
  }
});
