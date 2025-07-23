export default function EventDetailTable({ event }) {
  return (
    <table border="1" cellPadding="8">
      <tbody>
        <tr>
          <th>タイトル</th>
          <td>{event.event_title}</td>
        </tr>
        <tr>
          <th>日時</th>
          <td>{event.event_datetime}</td>
        </tr>
        <tr>
          <th>締切</th>
          <td>{event.deadline}</td>
        </tr>
        <tr>
          <th>場所</th>
          <td>{event.location}</td>
        </tr>
        <tr>
          <th>内容</th>
          <td>{event.content}</td>
        </tr>
        <tr>
          <th>説明</th>
          <td>{event.description}</td>
        </tr>
      </tbody>
    </table>
  );
}