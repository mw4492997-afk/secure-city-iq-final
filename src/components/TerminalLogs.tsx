case "net_stat":
          try {
            const netStatResponse = await fetch('/api/net-stat');
            const netData = await netStatResponse.json();
            if (netStatResponse.ok) {
              response = `IP: ${netData.ip} | LOCATION: ${netData.city}, ${netData.country} | TIMEZONE: ${netData.timezone} | STATUS: ${netData.network_status}`;
            } else {
              response = "ERR: Failed to retrieve network statistics";
            }
          } catch (error) {
            response = "ERR: Network statistics unavailable";
          }
          break;
