# GPU Passthrough Plan for 'gpumonster' (Proxmox)

**Objective:** Pass the NVIDIA RTX 4080 (01:00.0) to VM 100 (`gpumonster-ubuntu2404`) for AI Inference.

## Status

- **Host CPU:** AMD Ryzen 9 9900X
- **GPU:** NVIDIA RTX 4080 Super (`01:00.0`)
- **Current State:** IOMMU disabled, drivers not blacklisted.

## Phase 1: Host Configuration (Applied - Pending Reboot)

These changes have been staged. They will take effect after the next reboot.

1.  **Enable IOMMU**
    - Edited `/etc/default/grub`: Added `amd_iommu=on iommu=pt` to `GRUB_CMDLINE_LINUX_DEFAULT`.
    - Ran `update-grub`.

2.  **Load VFIO Modules**
    - Added to `/etc/modules`:
      - `vfio`
      - `vfio_iommu_type1`
      - `vfio_pci`
      - `vfio_virqfd`

3.  **Blacklist Host Drivers**
    - Created `/etc/modprobe.d/blacklist.conf`:
      - `blacklist nouveau`
      - `blacklist nvidia`
      - `blacklist nvidia_drm`
      - `blacklist nvidia_modeset`
      - `options kvm ignore_msrs=1`

4.  **Bind GPU to VFIO** (Required for clean isolation)
    - Run: `lspci -nn | grep -i nvidia` to get IDs (e.g., `10de:2704, 10de:22be`).
    - Add to `/etc/modprobe.d/vfio.conf`: `options vfio-pci ids=ID1,ID2 disable_vga=1`

5.  **CRITICAL: Update Initramfs**
    - Run: `update-initramfs -u -k all`

## Phase 2: Reboot Host

When ready to apply changes:

```bash
reboot
```

## Phase 3: Verify IOMMU & VFIO (After Reboot)

1. **Verify IOMMU:** `dmesg | grep -e DMAR -e IOMMU` (Look for "AMD-Vi: IOMMU enabled")
2. **Verify VFIO Binding:** `lspci -nnk -s 01:00.0`
   - Should show: `Kernel driver in use: vfio-pci`

## Phase 4: Configure VM 100

1.  **Optimize VM Hardware:**
    - Ensure **Machine:** `q35`
    - Ensure **BIOS:** `OVMF (UEFI)`
2.  **Add PCI Device with optimal flags:**

    ```bash
    qm set 100 -hostpci0 0000:01:00,pcie=1,x-vga=0
    ```

    _(Note: If the VM fails to boot, try adding `,rombar=0` to the end)._

3.  **Start VM:**
    ```bash
    qm start 100
    ```
4.  **Install Drivers (Inside VM):**
    ```bash
    ssh ubuntu@<ip>
    sudo apt install -y ubuntu-drivers-common
    sudo ubuntu-drivers autoinstall
    nvidia-smi
    ```

## Phase 5: Install Inference Engine (Ollama/vLLM)

Inside VM 100:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```
