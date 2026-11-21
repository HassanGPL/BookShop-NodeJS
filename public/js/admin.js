const deleteProduct = async (btn) => {
    const card = btn.closest('.admin-product-card');
    const csrf = card.querySelector('input[name="_csrf"]').value;
    const productId = card.querySelector('input[name="productId"]').value;

    btn.disabled = true;

    try {
        const response = await fetch(`/admin/product/${productId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'csrf-token': csrf
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Deleting product failed.');
        }

        card.remove();

        const grid = document.querySelector('.admin-product-grid');
        if (grid && !grid.querySelector('.admin-product-card')) {
            window.location.reload();
        }
    } catch (err) {
        alert(err.message);
        btn.disabled = false;
    }
};