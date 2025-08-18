import subprocess
import requests
import time
import signal

# Configuration
ARTILLERY_CMD = [
    r"C:\Users\steven\AppData\Roaming\npm\artillery.cmd",
    "run",
    "load/load_test.yml",
]
PROMETHEUS_URL = "http://localhost:9090/api/v1/query"
CPU_THRESHOLD = 50.0  # percent
MEM_THRESHOLD = 50.0  # percent
CHECK_INTERVAL = 5  # seconds
CONTAINER_NAME = "backend"  # cadvisor 'name' label
NAMESPACE = "/chat"  # namespace label in ws metrics


def query_prometheus(query):
    try:
        response = requests.get(PROMETHEUS_URL, params={"query": query})
        response.raise_for_status()
        data = response.json()
        if data["status"] == "success":
            return data["data"]["result"]
        return []
    except Exception as e:
        print(f"Error querying Prometheus: {e}")
        return []


def get_cpu_usage():
    query = f'sum(rate(container_cpu_usage_seconds_total{{name="{CONTAINER_NAME}"}}[1m])) * 100'
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def get_mem_usage():
    query = f'avg(container_memory_usage_bytes{{name="{CONTAINER_NAME}"}} / container_spec_memory_limit_bytes{{name="{CONTAINER_NAME}"}}) * 100'
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def get_cpu_cumulative():
    query = f'sum(container_cpu_usage_seconds_total{{name="{CONTAINER_NAME}"}})'
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def get_messages_total():
    query = f'sum(ws_messages_received_total{{namespace="{NAMESPACE}"}})'
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def get_active_users():
    query = f'avg(ws_active_connections{{namespace="{NAMESPACE}"}})'
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def get_disk_io():
    # Sum of read and write bytes per second over 1 minute interval
    query = f'sum(rate(container_fs_reads_total{{name="{CONTAINER_NAME}"}}[1m]) + rate(container_fs_writes_total{{name="{CONTAINER_NAME}"}}[1m]))'
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def get_network_io():
    # Sum of network receive and transmit bytes per second over 1 minute interval
    query = f"sum(rate(container_network_receive_bytes_total[1m]) + rate(container_network_transmit_bytes_total[1m]))"
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def get_queue_length():
    # Adjust metric name to your actual queue length metric
    query = f'avg(ws_queue_length{{namespace="{NAMESPACE}"}})'
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def get_worker_processing_time():
    # Average worker processing time in seconds - adjust metric name as needed
    query = f'avg(worker_process_time_seconds{{namespace="{NAMESPACE}"}})'
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def get_message_errors():
    # Count of message errors
    query = f'sum(ws_message_errors_total{{namespace="{NAMESPACE}"}})'
    data = query_prometheus(query)
    return float(data[0]["value"][1]) if data else None


def main():
    print("Starting Artillery test...")
    artillery_proc = subprocess.Popen(ARTILLERY_CMD)

    cpu_start = get_cpu_cumulative()
    messages_start = get_messages_total()
    if cpu_start is None or messages_start is None:
        print("Warning: Could not fetch initial CPU or message count metrics")

    try:
        while True:
            cpu_percent = get_cpu_usage()
            mem_percent = get_mem_usage()
            active_users = get_active_users()
            messages_total = get_messages_total()
            cpu_cumulative = get_cpu_cumulative()
            disk_io = get_disk_io()
            network_io = get_network_io()
            queue_length = get_queue_length()
            worker_time = get_worker_processing_time()
            message_errors = get_message_errors()

            cpu_str = f"{cpu_percent:.2f}%" if cpu_percent is not None else "N/A"
            mem_str = f"{mem_percent:.2f}%" if mem_percent is not None else "N/A"
            users_str = f"{active_users:.0f}" if active_users is not None else "N/A"
            disk_str = f"{disk_io / 1024:.2f} KB/s" if disk_io is not None else "N/A"
            net_str = (
                f"{network_io / 1024:.2f} KB/s" if network_io is not None else "N/A"
            )
            queue_str = f"{queue_length:.0f}" if queue_length is not None else "N/A"
            worker_str = f"{worker_time:.3f} s" if worker_time is not None else "N/A"
            error_str = (
                f"{int(message_errors)}" if message_errors is not None else "N/A"
            )

            print(
                f"CPU: {cpu_str} | MEM: {mem_str} | Active Users: {users_str} | "
                f"Disk I/O: {disk_str} | Net I/O: {net_str} | Queue Len: {queue_str} | "
                f"Worker Time: {worker_str} | Msg Errors: {error_str}",
                end="",
            )

            if (
                messages_total is not None
                and cpu_cumulative is not None
                and cpu_start is not None
                and messages_start is not None
            ):
                cpu_used = cpu_cumulative - cpu_start
                messages_processed = messages_total - messages_start
                if messages_processed > 0:
                    cpu_per_message = cpu_used / messages_processed
                    print(f" | CPU/msg: {cpu_per_message:.6f} sec", end="")
                else:
                    print(" | CPU/msg: N/A", end="")
            else:
                print("", end="")

            print()

            if cpu_percent is not None and cpu_percent > CPU_THRESHOLD:
                print(f"❗ CPU usage exceeded {CPU_THRESHOLD}%, stopping test.")
                artillery_proc.terminate()
                break

            if mem_percent is not None and mem_percent > MEM_THRESHOLD:
                print(f"❗ Memory usage exceeded {MEM_THRESHOLD}%, stopping test.")
                artillery_proc.terminate()
                break

            if artillery_proc.poll() is not None:
                print("✅ Artillery test completed.")
                break

            time.sleep(CHECK_INTERVAL)

    except KeyboardInterrupt:
        print("Interrupted by user, stopping Artillery.")
        artillery_proc.terminate()

    artillery_proc.wait()
    print("Test finished.")


if __name__ == "__main__":
    main()
